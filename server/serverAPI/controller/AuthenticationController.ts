import { Request, Response } from "express";
import { IUserDatabase } from "../../database/IUserDatabase";
import { Validator } from "../../utils/Validator";
import { UserSchema } from "../model/user/UserSchema";

/**
 * This class creates several properties responsible for authentication actions 
 * provided to the user.
 */
export class AuthenticationController {
    private database: IUserDatabase;

    constructor(database: IUserDatabase) {
        this.database = database;
    }

    /**
     * This property is a handler that is used for "login" action of the user.
     * User will only be able to login if request body contains UID of the user.
     * Upon successful login operation, this handler will redirect user to the /api/user route.
     * 
     * @param req Request parameter that holds information about request
     * @param res Response parameter that holds information about response
     */
    login = async (req: Request, res: Response) => {
        let existingUser : any = await this.database.GetUser(new Map([["uid", req.uid!]]));

        if (existingUser === null) {
            res.status(400).json({ success: false, data: `user doesn't exists` });
        } else { 
            res.redirect(302, `/user/${existingUser._id}`);
        }
    }

    /**
     * This property is a handler that is used for "register" action of the user.
     * User will only be able to register if request body contains UID of the user and no user with the same UID is already existing in the database.
     * Upon successful register operation, this handler will return full information about registered user. 
     * 
     * @param req Request parameter that holds information about request
     * @param res Response parameter that holds information about response
     */
    register = async (req: Request, res: Response) => {
        const newUser =
            new UserSchema(
                req.body.firstName,
                req.body.lastName,
                req.uid === undefined ? "" : req.uid
            );

        const validator = new Validator<UserSchema>();

        let logs = await validator.validate(newUser);

        if (logs.length > 0) {
            res.status(400).json({ success: false, data: logs });
        } else {
            let existingUser = await this.database.GetUser(new Map([["uid", newUser.uid]]));

            if (existingUser !== null) {
                res.status(400).json({ success: false, data: `uid ${newUser.uid} already exists` });
            } else {
                let createdUser = await this.database.CreateUser(newUser);

                if (createdUser === null) {
                    res.status(400).json({ success: false, data: newUser });
                } else {
                    res.status(200).json({ success: true, data: newUser });
                }
            }
        }
    }
}
