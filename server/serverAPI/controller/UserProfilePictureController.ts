import { isBase64 } from "class-validator";
import { Request, response, Response } from "express";
import IDatabase from "../../database/IDatabase";
import IImageAPI from "../../imageAPI/IImageAPI";
import { ResponseCodes } from "../../utils/ResponseCodes";

import IUser from "../model/user/IUser";
import BaseUserController from "./BaseUserController";

/**
 * This class creates several properties responsible for profile picture related actions 
 * provided to the user.
 */
export default class UserProfilePictureController extends BaseUserController {
    private imageAPI: IImageAPI;

    constructor(database: IDatabase<IUser>, imageAPI: IImageAPI) {
        super(database);
        this.imageAPI = imageAPI;
    }

    get = async (req: Request, res: Response) => {
        let parameters = new Map<string, any>([["username", req.serverUser.username]]);

        try {
            let user = await this.requestGet(parameters, res);

            if (!user.profilePicture) {
                return this.send(ResponseCodes.NOT_FOUND, res, "There is no image assigned to the user.");
            }

            return this.send(ResponseCodes.OK, res, user.profilePicture);
        } catch (response) {
            return response;
        }
    }

    /**
     * Assigns profile picture to the user's profile.
     * 
     * @param req Request parameter that holds information about request
     * @param res Response parameter that holds information about response
     */
    add = async (req: Request, res: Response) => {
        let parameters = new Map<string, any>([["username", req.serverUser.username]]);
        let imgAsBase64 = req.body?.imgAsBase64;

        if (!isBase64(imgAsBase64)) {
            return this.send(ResponseCodes.BAD_REQUEST, res, "Image provided is not in the base64 format.");
        }

        let user: IUser;
        try {
            user = await this.requestGet(parameters, res);
        } catch (response) {
            return response;
        }

        try {
            let image = await this.imageAPI.Get(imgAsBase64);

            user.profilePicture = image;

            let updatedUser = await this.requestUpdate(req.serverUser.username, user, res);
            return this.send(ResponseCodes.OK, res, updatedUser.profilePicture);
        } catch (response) {
            return this.send(ResponseCodes.BAD_REQUEST, res, response);
        }
    }

    /**
     * Deletes user's profile image.
     * 
     * @param req Request parameter that holds information about request.
     * @param res Response parameter that holds information about response.
     */
    delete = async (req: Request, res: Response) => {
        let parameters = new Map<string, any>([["username", req.serverUser.username]]);

        try {
            let user = await this.requestGet(parameters, res)


            if (!user.profilePicture) {
                return this.send(ResponseCodes.NOT_FOUND, res, "There is no image assigned to the user.");
            }

            user.profilePicture = undefined;

            let updatedUser = await this.requestUpdate(req.serverUser.username, user, res)
            return this.send(ResponseCodes.OK, res);
        } catch (response) {
            return response;
        }
    }
}
