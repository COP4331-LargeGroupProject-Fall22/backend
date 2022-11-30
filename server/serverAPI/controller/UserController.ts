import { Request, Response } from "express";
import { ResponseCodes } from "../../utils/ResponseCodes";

import Encryptor from "../../utils/Encryptor";

import JWTStorage from "../middleware/authentication/JWTStorage";

import IDatabase from '../../database/IDatabase';
import IUser from "../model/internal/user/IUser";

import UpdateRequestSchema from "../model/external/requests/user/UpdateRequest";

import BaseUserController from "./BaseController/BaseUserController";

/**
 * This class creates several properties responsible for user-actions 
 * provided to the user.
 */
export default class UserController extends BaseUserController {
    constructor(database: IDatabase<IUser>) {
        super(database);
    }

    protected parseUpdateRequest(req: Request, res: Response): Promise<UpdateRequestSchema> {
        let request = new UpdateRequestSchema(
            this.isStringUndefinedOrEmpty(req.body?.firstName) ? null : req.body.firstName,
            this.isStringUndefinedOrEmpty(req.body?.lastName) ? null : req.body.lastName,
            this.isStringUndefinedOrEmpty(req.body?.username) ? null : req.body.username,
            this.isStringUndefinedOrEmpty(req.body?.password) ? null : req.body.password,
            this.isStringUndefinedOrEmpty(req.body?.email) ? null : req.body.email
        );

        return this.verifySchema(request, res);
    }

    protected updateUserObjectWithRequestSchema(parsedRequest: UpdateRequestSchema, user: IUser): IUser {
        user.firstName = parsedRequest.firstName !== null ? parsedRequest.firstName : user.firstName;
        user.lastName = parsedRequest.lastName !== null ? parsedRequest.lastName : user.lastName;
        user.username = parsedRequest.username !== null ? parsedRequest.username : user.username;
        user.password = parsedRequest.password !== null ? parsedRequest.password : user.password;
        user.email = parsedRequest.email !== null ? parsedRequest.email : user.email;
        user.lastSeen = user.lastSeen;

        return user;
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
            return this.send(ResponseCodes.OK, res, this.convertToUserResponse(user));
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

        let parsedRequest: UpdateRequestSchema;
        let user: IUser;

        try {
            parsedRequest = await this.parseUpdateRequest(req, res);
            user = await this.requestGet(parameters, res);
        } catch (response) {
            return response;
        }

        if (parsedRequest.username !== null) {
            let result = await this.isUnique(parsedRequest.username);

            if (!result) {
                return this.send(ResponseCodes.BAD_REQUEST, res, "Username already exists.");
            }
        }

        if (parsedRequest.password !== null && parsedRequest.password !== user.password) {
            parsedRequest.password = await new Encryptor().encrypt(parsedRequest.password);
        }

        if (parsedRequest.email !== null && parsedRequest.email !== user.email) {
            JWTStorage.getInstance()?.deleteJWT(user.username);
            user.isVerified = false;
        }

        let updatedUser = await this.requestUpdate(
            req.serverUser.username,
            this.updateUserObjectWithRequestSchema(
                parsedRequest,
                user
            ),
            res
        );

        return this.send(ResponseCodes.OK, res, this.convertToUserResponse(updatedUser));
    }

    /**
     * Deletes user object at specified userID.
     * 
     * @param req Request parameter that holds information about request.
     * @param res Response parameter that holds information about response.
     */
    delete = async (req: Request, res: Response) => {
        let parameters = new Map<string, any>([["username", req.serverUser.username]]);

        try {
            let user = await this.requestGet(parameters, res);

            let result = await this.requestDelete(req.serverUser.username, res)
            if (!result) {
                return this.send(ResponseCodes.BAD_REQUEST, res, "User could not be deleted.");
            }

            JWTStorage.getInstance().deleteJWT(user.username);

            return this.send(ResponseCodes.OK, res);
        } catch (response) {
            return response;
        }
    }
}
