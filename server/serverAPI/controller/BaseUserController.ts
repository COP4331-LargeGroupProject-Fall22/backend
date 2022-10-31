import { Request, Response } from "express";
import IDatabase from "../../database/IDatabase";
import ResponseFormatter from "../../utils/ResponseFormatter";
import { ResponseTypes } from "../../utils/ResponseTypes";
import IUser from "../model/user/IUser";
import IUserResponse from "../model/user/responseSchema/IUserResponse";
import BaseController from "./BaseController";

export default class BaseUserController extends BaseController {
    protected database: IDatabase<IUser>;

    constructor(database: IDatabase<IUser>) {
        super();
        this.database = database;
    }

    protected convertToUserResponse(user: IUser): IUserResponse {
        return {
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            lastSeen: user.lastSeen
        }
    }

    protected async requestCreate(user: IUser, res: Response): Promise<IUser> {
        return this.database.Create(user).then(createdUser => {
            if (createdUser === null) {
                return Promise.reject(res.status(400)
                    .json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, "User could not be created.")));
            }

            return Promise.resolve(createdUser);
        }, (error) => {
            return Promise.reject(res.status(400)
                .json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, this.getException(error))));
        });
    }

    protected async requestUpdate(id: string, user: IUser, res: Response): Promise<IUser> {
        return this.database.Update(id, user).then(updatedUser => {
            if (updatedUser === null) {
                return Promise.reject(res.status(400)
                    .json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, "User could not be updated.")));
            }

            return Promise.resolve(updatedUser);
        }, (error) => {
            return Promise.reject(res.status(400)
                .json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, this.getException(error))));
        });
    }

    protected async requestDelete(id: string, res: Response): Promise<boolean> {
        return this.database.Delete(id).then(result => {
            if (!result) {
                return Promise.reject(res.status(404)
                    .json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, "User could not be deleted.")));
            }

            return Promise.resolve(true);
        }, () => Promise.resolve(false));
    }

    protected async requestGet(parameters: Map<string, any>, res: Response): Promise<IUser> {
        return this.database.Get(parameters).then(async user => {
            if (user === null) {
                return Promise.reject(res.status(404)
                    .json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, "User could not be found.")));
            }

            return Promise.resolve(user);
        }, (error) => {
            return Promise.reject(res.status(400)
                .json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, this.getException(error))));
        });
    }
}
