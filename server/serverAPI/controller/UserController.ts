import { Request, Response } from "express";
import IDatabase from '../../database/IDatabase';
import ResponseFormatter from "../../utils/ResponseFormatter";
import { ResponseTypes } from "../../utils/ResponseTypes";
import IUser from "../model/user/IUser";
import UserSchema from "../model/user/requestSchema/UserSchema";
import BaseUserController from "./BaseUserController";

/**
 * This class creates several properties responsible for user-actions 
 * provided to the user.
 */
export default class UserController extends BaseUserController {
    constructor(database: IDatabase<IUser>) {
        super(database);
    }

    protected async getUserFromRequest(req: Request, res: Response, user: IUser): Promise<IUser> {
        let userSchema = new UserSchema(
            this.isStringUndefinedOrEmpty(req.body?.firstName) ? user.firstName : req.body.firstName,
            this.isStringUndefinedOrEmpty(req.body?.lastName) ? user.lastName : req.body.lastName,
            this.isStringUndefinedOrEmpty(req.body?.username) ? user.username : req.body.username,
            this.isStringUndefinedOrEmpty(req.body?.password) ? user.password : req.body.password,
            user.lastSeen,
        );

        let logs = await userSchema.validate();

        if (logs.length > 0) {
            return Promise.reject(res.status(400)
                .json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, logs)));
        }

        let newUser: IUser = {
            inventory: user.inventory,
            firstName: userSchema.firstName,
            lastName: userSchema.lastName,
            lastSeen: user.lastSeen,
            password: userSchema.password,
            username: userSchema.username
        };

        return newUser;
    }

    /**
     * Gets information about user at specified userID.
     *  
     * @param req Request parameter that holds information about request.
     * @param res Response parameter that holds information about response.
     */
    get = async (req: Request, res: Response) => {
        let parameters = new Map<string, any>([["username", req.serverUser.username]]);

        return this.requestGet(parameters, res).then(user => {
            return this.sendSuccess(200, res, this.convertToUserResponse(user));
        }, (response) => response);
    }

    private async isUnique(username: string): Promise<boolean> {
        return this.database.Get(new Map([["username", username]])).then(user => {
            return user === null;
        });
    }

    /**
     * Updates information of the user at specified userID.
     * 
     * @param req Request parameter that holds information about request.
     * @param res Response parameter that holds information about response.
     */
    update = async (req: Request, res: Response) => {
        let parameters = new Map<string, any>([["username", req.serverUser.username]]);

        return this.requestGet(parameters, res).then(async user => {
            if (req.body.username !== undefined) {
                let result = await this.isUnique(req.body.username);

                if (!result) {
                    return this.sendError(404, res, "Username already exists.");
                }
            }

            return this.getUserFromRequest(req, res, user).then(validatedUser => {
                return this.requestUpdate(req.serverUser.username, validatedUser, res)
                    .then(updatedUser =>
                        this.sendSuccess(200, res, this.convertToUserResponse(updatedUser)), (response) => response);
            }, (response) => response);
        }, (response) => response);
    }

    /**
     * Deletes user object at specified userID.
     * 
     * @param req Request parameter that holds information about request.
     * @param res Response parameter that holds information about response.
     */
    delete = async (req: Request, res: Response) => {
        let parameters = new Map<string, any>([["username", req.serverUser.username]]);

        return this.requestGet(parameters, res).then(() => {
            return this.requestDelete(req.serverUser.username, res).then(result => {
                if (!result) {
                    return this.sendError(400, res, "User could not be deleted.");
                }

                return this.sendSuccess(200, res);
            }, (response) => response);
        }, (response) => response);
    }
}
