import { Request, Response } from "express";
import IDatabase from "../../database/IDatabase";
import ResponseFormatter from "../../utils/ResponseFormatter";
import { ResponseTypes } from "../../utils/ResponseTypes";
import { Validator } from "../../utils/Validator";
import IUser from "../model/user/IUser";
import UserSchema from "../model/user/UserSchema";

/**
 * This class creates several properties responsible for authentication actions 
 * provided to the user.
 */
export default class AuthenticationController {
    private database: IDatabase<IUser>;

    constructor(database: IDatabase<IUser>) {
        this.database = database;
    }

    /**
     * Lets client to login into the server using token from authorization header.
     * Upon successful login operation, this handler will redirect user to the /api/user route.
     * 
     * @param req Request parameter that holds information about request
     * @param res Response parameter that holds information about response
     */
    login = async (req: Request, res: Response) => {
        if (req.uid === undefined) {
            res.status(400).json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, "UID hasn't been found."));
            return;
        }

        let parameters = new Map([
            ["uid", req.uid]
        ]);

        let user = await this.database.GetUser(parameters);

        if (user === null) {
            res.status(400).json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, `User doesn't exists.`));
            return;
        }

        // Workaround has yet to be found
        res.redirect(302, `/user/${(user as any)._id}`);
    }

    /**
     * Let's client to register their account on the server.
     * Client is expected to provide all required information and token in authorization header.
     * Upon successful register operation, this handler will return full information about registered user. 
     * 
     * @param req Request parameter that holds information about request
     * @param res Response parameter that holds information about response
     */
    register = async (req: Request, res: Response) => {
        if (req.uid === undefined) {
            res.status(400).json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, "UID hasn't been found."));
            return;
        }

        let parameters = new Map([
            ["uid", req.uid]
        ]);

        const newUser =
            new UserSchema(
                req.body?.firstName,
                req.body?.lastName,
                req.uid
            );

        const validator = new Validator();

        let logs = await validator.validate(newUser);

        if (logs.length > 0) {
            res.status(400).json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, logs));
            return;
        }

        let user = await this.database.GetUser(parameters);

        if (user !== null) {
            res.status(400).json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, `User with such UID already exists.`));
            return;
        }

        let createdUser = await this.database.CreateUser(newUser);

        if (createdUser === null) {
            res.status(400).json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR));
            return;
        }

        res.status(200).json(ResponseFormatter.formatAsJSON(ResponseTypes.SUCCESS, createdUser));
    }
}
