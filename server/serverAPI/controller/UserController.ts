import { Request, Response } from "express";
import IDatabase from '../../database/IDatabase';
import ResponseFormatter from "../../utils/ResponseFormatter";
import { ResponseTypes } from "../../utils/ResponseTypes";
import IBaseUser from "../model/user/IBaseUser";
import IInternalUser from "../model/user/IInternalUser";
import ISensitiveUser from "../model/user/ISensitiveUser";

/**
 * This class creates several properties responsible for user-actions 
 * provided to the user.
 */
export default class UserController {
    private database: IDatabase<IInternalUser>;

    constructor(database: IDatabase<IInternalUser>) {
        this.database = database;
    }

    private getException(error: unknown): string {
        if (error instanceof Error) {
            return error.message;
        }

        return String(error);
    }

    private convertToBaseUser(user: IInternalUser): IBaseUser {
        return {
            firstName: user.firstName,
            lastName: user.lastName,
            lastSeen: user.lastSeen
        };
    }

    private convertToSensitiveUser(user: ISensitiveUser): ISensitiveUser {
        return {
            firstName: user.firstName,
            lastName: user.lastName,
            lastSeen: user.lastSeen,
            inventory: user.inventory
        };
    }

    private isAuthorized(req: Request, user: IInternalUser): boolean {
        return req.uid === user.uid;
    }

    /**
     * Lets client to get information about all users existed on the server.
     * Upon successful operation, this handler will return all users (including their non-sensitive information) existed on the server. 
     * 
     * @param req Request parameter that holds information about request
     * @param res Response parameter that holds information about response
     */
    getUsers = async (req: Request, res: Response) => {
        let users: IInternalUser[] | null;
        try {
            users = await this.database.GetAll();
        } catch (error) {
            res.status(400).json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, this.getException(error)));
            return;
        }

        let baseUsers: IBaseUser[] = [];
        users?.forEach(user => {
            baseUsers.push(this.convertToBaseUser(user));
        });

        res.status(200).json(ResponseFormatter.formatAsJSON(ResponseTypes.SUCCESS, baseUsers.length === 0 ? null : baseUsers));
    }

    /**
     * Lets client to get information about user at specified userID.
     * Upon successful operation, this handler will return complete information about specific user only if uid of the user with accessToken and uid of the 
     * user at userID are the same.
     *  
     * @param req Request parameter that holds information about request
     * @param res Response parameter that holds information about response
     */
    getUser = async (req: Request, res: Response) => {
        let parameters = new Map<String, any>([
            ["_id", req.params.userID]
        ]);

        let user: IInternalUser | null;
        try {
            user = await this.database.Get(parameters);
        } catch (error) {
            res.status(400).json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, this.getException(error)));
            return;
        }

        if (user === null) {
            res.status(404).json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, "User hasn't been found."));
            return;
        }

        if (!this.isAuthorized(req, user)) {
            res.status(401).json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, "User is trying to perform an operation on account that doesn't belong to them."));
            return;
        }

        let sensitiveUser = this.convertToSensitiveUser(user);

        res.status(200).json(ResponseFormatter.formatAsJSON(ResponseTypes.SUCCESS, sensitiveUser));
    }

    /**
     * Lets client to update information of the user at specified userID.
     * Upon successful operation, this handler will return updated user object only if uid of the user with accessToken and uid of the 
     * user at userID are the same.
     * 
     * @param req Request parameter that holds information about request
     * @param res Response parameter that holds information about response
     */
    updateUser = async (req: Request, res: Response) => {
        let parameters = new Map<string, any>([
            ["_id", req.params.userID]
        ]);

        let user: IInternalUser | null;
        try {
            user = await this.database.Get(parameters);
        } catch (error) {
            res.status(400).json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, this.getException(error)));
            return;
        }

        if (user === null) {
            res.status(404).json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, "User hasn't been found."));
            return;
        }

        let updatedUser: IInternalUser | null;
        try {
            updatedUser = await this.database.Update(
                req.params.userID,
                {
                    uid: user.uid,
                    firstName: req.body.firstName === undefined ? user.firstName : req.body.firstName,
                    lastName: req.body.lastName === undefined ? user.lastName : req.body.lastName,
                    lastSeen: user.lastSeen,
                    inventory: user.inventory
                }
            );
        } catch (error) {
            res.status(400).json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, this.getException(error)));
            return;
        }

        if (updatedUser === null) {
            res.status(404).json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, "User couldn't been updated."));
            return;
        }

        if (!this.isAuthorized(req, user)) {
            res.status(401).json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, "User is trying to perform an operation on account that doesn't belong to them."));
            return;
        }

        let sensitiveUser = this.convertToSensitiveUser(updatedUser);

        res.status(200).json(ResponseFormatter.formatAsJSON(ResponseTypes.SUCCESS, sensitiveUser));
    }

    /**
     * Lets client to delete user object at specified userID.
     * Upon successful operation, this handler will delete user object only if uid of the user with accessToken and uid of the 
     * user at userID are the same.
     * 
     * @param req Request parameter that holds information about request
     * @param res Response parameter that holds information about response
     */
    deleteUser = async (req: Request, res: Response) => {
        let parameters = new Map([
            ["_id", req.params.userID]
        ]);

        let user: IInternalUser | null;
        try {
            user = await this.database.Get(parameters);
        } catch (error) {
            res.status(400).json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, this.getException(error)));
            return;
        }

        if (user === null) {
            res.status(404).json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, "User hasn't been found."));
            return;
        }

        if (!this.isAuthorized(req, user)) {
            res.status(401).json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, "User is trying to perform an operation on account that doesn't belong to them."));
            return;
        }

        let result: boolean
        try {
            result = await this.database.Delete(req.params.userID);
        } catch (error) {
            res.status(400).json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, this.getException(error)));
            return;
        }

        if (!result) {
            res.status(404).json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, "Delete was unsuccessful."));
            return;
        }

        res.status(200).json(ResponseFormatter.formatAsJSON(ResponseTypes.SUCCESS));
    }
}
