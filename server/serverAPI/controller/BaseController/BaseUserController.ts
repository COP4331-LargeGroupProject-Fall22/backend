import { Response } from "express";

import { ResponseCodes } from "../../../utils/ResponseCodes";

import IDatabase from "../../../database/IDatabase";
import IUser from "../../model/internal/user/IUser";
import IUserResponse from "../../model/external/responses/user/IUserResponse";

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
            lastSeen: user.lastSeen,
            email: user.email
        }
    }

    protected async userExists(username: string, res: Response): Promise<boolean> {
        return this.database.Get(new Map([["username", username]])).then(async user => {
            return Promise.resolve(user !== null);
        }, (error) => {
            return Promise.reject(this.send(ResponseCodes.BAD_REQUEST, res, error))
        });
    }

    protected async requestCreate(user: IUser, res: Response): Promise<IUser> {
        return this.database.Create(user).then(createdUser => {
            if (createdUser === null) {
                return Promise.reject(this.send(ResponseCodes.BAD_REQUEST, res, "User could not be created."));
            }

            return createdUser;
        }, (error) => Promise.reject(this.send(ResponseCodes.BAD_REQUEST, res, this.getException(error))));
    }

    protected async requestUpdate(id: string, user: IUser, res: Response): Promise<IUser> {
        return this.database.Update(id, user).then(updatedUser => {
            if (updatedUser === null) {
                return Promise.reject(this.send(ResponseCodes.BAD_REQUEST, res, "User could not be updated."));
            }

            return updatedUser;
        }, (error) => Promise.reject(this.send(ResponseCodes.BAD_REQUEST, res, this.getException(error))));
    }

    protected async requestDelete(id: string, res: Response): Promise<boolean> {
        return this.database.Delete(id).then(result => {
            if (!result) {
                return Promise.reject(this.send(ResponseCodes.BAD_REQUEST, res, "User could not be deleted."));
            }

            return true;
        }, (error) => Promise.reject(this.send(ResponseCodes.BAD_REQUEST, res, this.getException(error))));
    }

    protected async requestGet(parameters: Map<string, any>, res: Response): Promise<IUser> {
        return this.database.Get(parameters).then(async user => {
            if (user === null) {
                return Promise.reject(this.send(ResponseCodes.NOT_FOUND, res, "User could not be found."));
            }

            return user;
        }, (error) => Promise.reject(this.send(ResponseCodes.BAD_REQUEST, res, this.getException(error))));
    }
}
