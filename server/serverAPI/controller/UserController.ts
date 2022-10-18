import { Validator } from "../../utils/Validator";
import { Request, Response } from "express";
import { IUserDatabase } from '../../database/IUserDatabase';
import { UserSchema } from '../model/user/UserSchema';

/**
 * This class creates several properties responsible for user-actions 
 * provided to the user.
 */
export class UserController {
    private database: IUserDatabase;

    constructor(database: IUserDatabase) {
        this.database = database;
    }

    /**
     * This property is a handler that is used for "getUsers" action of the user.
     * It provides user with an ability to receive summary of non-sensitive information about all existing users in the database.
     * 
     * @param req Request parameter that holds information about request
     * @param res Response parameter that holds information about response
     */
    getUsers = async (req: Request, res: Response) => {
        this.database.GetUsers()
            .then(users => res.status(200).json({ success: true, data: users }));
    }

    /**
     * This property is a handler that is used for "getUser" action of the user.
     * It provides user with an ability to receive their own information (complete information) from the database.
     * 
     * @param req Request parameter that holds information about request
     * @param res Response parameter that holds information about response
     */
    getUser = async (req: Request, res: Response) => {
        let userID = req.params.id;

        const validator = new Validator();

        let logs = await validator.validateObjectId(userID)

        if (logs.length > 0) {
            res.status(400).json({ success: false, data: logs });
        } else {

            let parameters = new Map<String, any>([
                ["_id", userID]
            ]);

            let userFound = await this.database.GetUser(parameters);

            if (userFound === null) {
                res.status(404).json({ success: false, data: null });
            } else {
                res.status(200).json({ success: true, data: userFound });
            }
        }
    }
    /**
     * This property is a handler that is used for "updateUser" action of the user.
     * It provides user with an ability to update their own information on the database.
     * 
     * @param req Request parameter that holds information about request
     * @param res Response parameter that holds information about response
     */
    updateUser = async (req: Request, res: Response) => {
        let userID = req.params.id;

        const newUser =
            new UserSchema(
                req.body.firstName,
                req.body.lastName,
                req.body.uid
            );

        const validator = new Validator<UserSchema>();

        let logs = (await validator.validate(newUser))
            .concat(await validator.validateObjectId(userID));

        if (logs.length > 0) {
            res.status(400).json({ success: false, data: logs });
        } else {
            let existingUser = await this.database.GetUser(new Map([["_id", userID]]));

            if (existingUser === null) {
                res.status(404).json({ success: false, data: null });
            } else {
                let updatedUser = await this.database.UpdateUser(userID, newUser);

                res.status(200).json({ success: true, data: updatedUser });
            }
        }
    }
    /**
     * This property is a handler that is used for "deleteUser" action of the user.
     * It provides user with an ability to delete their own information from the database.
     * 
     * @param req Request parameter that holds information about request
     * @param res Response parameter that holds information about response
     */
    deleteUser = async (req: Request, res: Response) => {
        let userID = req.params.id;

        const validator = new Validator<UserSchema>();

        let logs = await validator.validateObjectId(userID);

        if (logs.length > 0) {
            res.status(400).json({ success: false, data: logs });
        } else {
            let result = await this.database.DeleteUser(userID);

            if (result) {
                res.status(200).json({ success: true, data: null });
            } else {
                res.status(404).json({ success: false, data: null });
            }
        }
    }
}
