import { Request, Response } from "express";
import IDatabase from "../../database/IDatabase";
import ResponseFormatter from "../../utils/ResponseFormatter";
import { ResponseTypes } from "../../utils/ResponseTypes";
import IBaseUser from "../model/user/IBaseUser";
import IUser from "../model/user/IUser";
import UserSchema from "../model/user/requestSchema/UserSchema";
import BaseController from "./BaseController";

export default class BaseUserController extends BaseController {
    protected database: IDatabase<IUser>;

    constructor(database: IDatabase<IUser>) {
        super();
        this.database = database;
    }

    protected convertToBaseUser(user: IUser): IBaseUser {
        return {
            firstName: user.firstName,
            lastName: user.lastName,
            lastSeen: user.lastSeen
        };
    }

    protected async validateUser(req: Request, res: Response, user: IUser): Promise<IUser> {
        let userSchema = new UserSchema(
            req.body.firstName === undefined ? user.firstName : req.body.firstName,
            req.body.lastName === undefined ? user.lastName : req.body.lastName,
            req.body.username === undefined ? user.username : req.body.username,
            req.body.password === undefined ? user.password : req.body.password,
            user.lastSeen,
        );

        let logs = await userSchema.validate();

        if (logs.length > 0) {
            return Promise.reject(res.status(400)
                .json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, logs)));
        }

        let newUser: IUser = {
            inventory: user.inventory,
            firstName: user.firstName,
            lastName: user.lastName,
            lastSeen: user.lastSeen,
            password: user.password,
            username: user.username
        };

        return Promise.resolve(newUser);
    }

    protected async updateUser(req: Request, res: Response, user: IUser): Promise<IUser> {
        return this.database.Update(req.serverUser.username, user).then(updatedUser => {
            if (updatedUser === null) {
                return Promise.reject(res.status(400)
                    .json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, "User update error.")));
            }

            return Promise.resolve(updatedUser);
        }, (error) => {
            return Promise.reject(res.status(400)
                .json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, this.getException(error))));
        });
    }

    protected async getUser(req: Request, res: Response): Promise<IUser> {
        let parameters = new Map<string, any>([
            ["username", req.serverUser.username]
        ]);

        return this.database.Get(parameters).then(async user => {
            if (user === null) {
                return Promise.reject(res.status(404)
                    .json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, "User hasn't been found")));
            }

            return Promise.resolve(user);
        }, (error) => {
            return Promise.reject(res.status(400)
                .json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, this.getException(error))));
        });
    }
}
