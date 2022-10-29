import { Request, Response } from "express";
import IDatabase from "../../database/IDatabase";
import ResponseFormatter from "../../utils/ResponseFormatter";
import { ResponseTypes } from "../../utils/ResponseTypes";
import IUser from "../model/user/IUser";

/**
 * This class creates several properties responsible for authentication actions 
 * provided to the user.
 */
export default class AuthenticationController {
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
     * Logs client into the server using token from authorization header.
     * Upon successful login operation, this handler will redirect user to the /api/user route.
     * 
     * @param req Request parameter that holds information about request.
     * @param res Response parameter that holds information about response.
     */
    login = async (req: Request, res: Response) => {
        let parameters = new Map([
            ["uid", req.uid]
        ]);

        let user: IUser | null;
        try {
            user = await this.database.GetUser(parameters);
        } catch (error) {
            res.status(400)
                .json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, this.getException(error)));
            return;
        }

        if (user === null) {
            res.status(400)
                .json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, `User doesn't exist.`));
            return;
        }

        res.status(200)
            .json(ResponseFormatter.formatAsJSON(ResponseTypes.SUCCESS, user));
    }

    /**
     * Registers client account on the server.
     * Client is expected to provide all required information and token in authorization header.
     * Upon successful register operation, this handler will return full information about registered user. 
     * 
     * @param req Request parameter that holds information about request.
     * @param res Response parameter that holds information about response.
     */
    register = async (req: Request, res: Response) => {
        let parameters = new Map([
            ["uid", req.uid]
        ]);

        let user: IUser | null;
        try {
            user = await this.database.GetUser(parameters);
        } catch (error) {
            res.status(400)
                .json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, this.getException(error)));
            return;
        }

        if (user !== null) {
            res.status(400)
                .json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, `User with such UID already exists.`));
            return;
        }

        const newUser: IUser = {
            uid: String(req.uid),
            firstName: req.body?.firstName,
            lastName: req.body?.lastName,
            lastSeen: Date.now(),
            inventory: []
        };

        let createdUser: IUser | null;
        try {
            createdUser = await this.database.CreateUser(newUser);
        } catch (error) {
            res.status(400)
                .json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, this.getException(error)));
            return;
        }

        if (createdUser === null) {
            res.status(400)
                .json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, "Couldn't create user."));
            return;
        }

        res.status(200)
            .json(ResponseFormatter.formatAsJSON(ResponseTypes.SUCCESS, createdUser));
    }
}
