import { Request, Response } from "express";
import IDatabase from '../../database/IDatabase';
import ResponseFormatter from "../../utils/ResponseFormatter";
import { ResponseTypes } from "../../utils/ResponseTypes";
import IUser from "../model/user/IUser";

/**
 * This class creates several properties responsible for user-actions 
 * provided to the user.
 */
export default class UserController {
    private database: IDatabase<IUser>;

    constructor(database: IDatabase<IUser>) {
        this.database = database;
    }

    private getException(error: unknown): string {
        if (error instanceof Error) {
            return error.message;
        }

        return String(error);
    }

    /**
     * Gets information about all users existed on the server.
     * 
     * @param req Request parameter that holds information about request.
     * @param res Response parameter that holds information about response.
     */
    getUsers = async (req: Request, res: Response) => {
        let users: Partial<IUser>[] | null;
        try {
            users = await this.database.GetUsers();
        } catch (error) {
            res.status(400).json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, this.getException(error)));
            return;
        }

        res.status(200).json(ResponseFormatter.formatAsJSON(ResponseTypes.SUCCESS, users));
    }

    /**
     * Gets information about user at specified userID.
     *  
     * @param req Request parameter that holds information about request.
     * @param res Response parameter that holds information about response.
     */
    getUser = async (req: Request, res: Response) => {
        let parameters = new Map<String, any>([
            ["_id", req.params.userID]
        ]);

        let user: IUser | null;
        try {
            user = await this.database.GetUser(parameters);
        } catch (error) {
            res.status(400).json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, this.getException(error)));
            return;
        }

        if (user === null) {
            res.status(404).json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, "User hasn't been found."));
            return;
        }

        res.status(200).json(ResponseFormatter.formatAsJSON(ResponseTypes.SUCCESS, user));
    }

    /**
     * Updates information of the user at specified userID.
     * 
     * @param req Request parameter that holds information about request.
     * @param res Response parameter that holds information about response.
     */
    updateUser = async (req: Request, res: Response) => {
        let parameters = new Map<string, any>([
            ["_id", req.params.userID]
        ]);

        let user: IUser | null;
        try {
            user = await this.database.GetUser(parameters);
        } catch (error) {
            res.status(400).json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, this.getException(error)));
            return;
        }

        if (user === null) {
            res.status(404).json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, "User doesn't exist"));
            return;
        }

        let updatedUser: IUser | null;
        try {
            updatedUser = await this.database.UpdateUser(
                req.params.userID,
                {
                    uid: req.body.uid === undefined ? user.uid : req.body.uid,
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
            res.status(404).json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, "User couldn't be updated."));
            return;
        }

        res.status(200).json(ResponseFormatter.formatAsJSON(ResponseTypes.SUCCESS, updatedUser));
    }

    /**
     * Deletes user object at specified userID.
     * 
     * @param req Request parameter that holds information about request.
     * @param res Response parameter that holds information about response.
     */
    deleteUser = async (req: Request, res: Response) => {
        let parameters = new Map([
            ["_id", req.params.userID]
        ]);

        let user: IUser | null;
        try {
            user = await this.database.GetUser(parameters);
        } catch (error) {
            res.status(400).json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, this.getException(error)));
            return;
        }

        if (user === null) {
            res.status(404).json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, "User hasn't been found."));
            return;
        }

        let result: boolean;
        try {
            result = await this.database.DeleteUser(req.params.userID);
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
