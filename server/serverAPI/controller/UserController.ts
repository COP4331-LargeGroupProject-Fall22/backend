import { Request, Response } from "express";
import IDatabase from '../../database/IDatabase';
import ResponseFormatter from "../../utils/ResponseFormatter";
import { ResponseTypes } from "../../utils/ResponseTypes";
import IBaseUser from "../model/user/IBaseUser";
import IUser from "../model/user/IUser";
import BaseUserController from "./BaseUserController";

/**
 * This class creates several properties responsible for user-actions 
 * provided to the user.
 */
export default class UserController extends BaseUserController {
    constructor(database: IDatabase<IUser>) {
        super(database);
    }

    /**
     * Gets information about all users existed on the server.
     * 
     * @param req Request parameter that holds information about request.
     * @param res Response parameter that holds information about response.
     */
    getAll = async (req: Request, res: Response) => {
        this.database.GetAll().then(users => {
            let baseUsers: IBaseUser[] = [];

            users?.forEach(user => {
                baseUsers.push(this.convertToBaseUser(user));
            });

            return res.status(200)
                .json(ResponseFormatter.formatAsJSON(ResponseTypes.SUCCESS, baseUsers.length === 0 ? null : baseUsers));
        }, (error) => {
            return res.status(400)
                .json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, this.getException(error)));
        });
    }

    /**
     * Gets information about user at specified userID.
     *  
     * @param req Request parameter that holds information about request.
     * @param res Response parameter that holds information about response.
     */
    get = async (req: Request, res: Response) => {
        return this.getUser(req, res).then(user => {
            return res.status(200)
                .json(ResponseFormatter.formatAsJSON(ResponseTypes.SUCCESS, user));
        }, (response) => response);
    }

    private async isUnique(username: string): Promise<boolean> {
        return this.database.Get(new Map([["username", username]])).then(user => {
            if (user === null) {
                return true;
            }

            return false;
        });
    }

    /**
     * Updates information of the user at specified userID.
     * 
     * @param req Request parameter that holds information about request.
     * @param res Response parameter that holds information about response.
     */
    update = async (req: Request, res: Response) => {
        return this.getUser(req, res).then(async user => {
            if (req.body.username !== undefined) {
                let result = await this.isUnique(req.body.username);

                if (!result) {
                    return res.status(400)
                        .json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, "User with such username already exists."));
                }
            }

            return this.validateUser(req, res, user).then(validatedUser => {
                return this.updateUser(req, res, validatedUser).then(updatedUser => {
                    return res.status(200)
                        .json(ResponseFormatter.formatAsJSON(ResponseTypes.SUCCESS, updatedUser));
                }, (response) => response);
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
        return this.getUser(req, res).then(user => {
            return this.database.Delete(req.serverUser.username).then(result => {
                if (!result) {
                    return res.status(404)
                        .json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, "Delete was unsuccessful."));
                }

                return res.status(200)
                    .json(ResponseFormatter.formatAsJSON(ResponseTypes.SUCCESS));

            }, (error) => {
                return res.status(400)
                    .json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, this.getException(error)));
            });
        }, (response) => response);
    }
}
