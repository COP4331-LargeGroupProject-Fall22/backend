import { Validator } from "../../utils/Validator";
import { Request, Response } from "express";
import { IUserDatabase } from '../../database/IUserDatabase';
import { UserSchema } from '../model/user/UserSchema';

export class UserController {
    private database: IUserDatabase;

    constructor(database: IUserDatabase) {
        this.database = database;
    }

    getUsers = async (req: Request, res: Response) => {
        this.database.GetUsers()
            .then(users => res.status(200).json({ success: true, data: users }));
    }

    getUser = async (req: Request, res: Response) => {
        let userID = req.params.id;

        const validator = new Validator();

        let logs = await validator.validateObjectId(userID)

        if (logs.length > 0)
            res.status(400).json({ success: false, data: logs });
        else {

            let parameters = new Map<String, any>([
                ["_id", userID]
            ]);

            this.database.GetUser(parameters)
                .then(user => res.status(200).json({ success: true, data: user }));
        }
    }

    updateUser = async (req: Request, res: Response) => {
        let userID = req.params.id;

        const newUser =
            new UserSchema(
                req.body.firstName,
                req.body.lastName,
                req.uid === undefined ? "" : req.uid
            );

        const validator = new Validator<UserSchema>();

        let logs = (await validator.validate(newUser))
            .concat(await validator.validateObjectId(userID));

        if (logs.length > 0)
            res.status(400).json({ success: false, data: logs });
        else {
            let existingUser = await this.database.GetUser(new Map([["_id", userID]]));

            if (existingUser === null)
                res.status(400).json({ success: false, data: null });
            else {
                let updatedUser = await this.database.UpdateUser(userID, newUser);

                res.status(200).json({ success: true, data: updatedUser });
            }
        }
    }

    deleteUser = async (req: Request, res: Response) => {
        let userID = req.params.id;

        const validator = new Validator<UserSchema>();

        let logs = await validator.validateObjectId(userID);

        if (logs.length > 0)
            res.status(400).json({ success: false, data: logs });
        else {
            let result = await this.database.DeleteUser(userID);

            if (result)
                res.status(200).json({ success: true, data: null });
            else
                res.status(400).json({ success: false, data: null });
        }
    }
}
