import { Validator } from "../../utils/Validator";
import { Request, Response } from "express";
import { IDatabase } from '../../database/IDatabase';
import { UserSchema } from '../model/user/UserSchema';

export class UserController {
    private database: IDatabase;

    constructor(database: IDatabase) {
        this.database = database;
    }

    getUsers = (req: Request, res: Response) => {
        this.database.GetUsers(null)
            .then(users => res.status(200).json({ success: true, data: users }));
    }

    getUser = (req: Request, res: Response) => {
        let parameters = new Map<String, String>([
            ["username", req.params.username]
        ]);

        this.database.GetUser(parameters)
            .then(user => res.status(200).json({ success: true, data: user }));
    }

    postUser = async (req: Request, res: Response) => {
        const newUser =
            new UserSchema(
                req.body.firstName,
                req.body.lastName,
                req.body.email,
                req.body.username,
                req.body.password,
            );

        const validator = new Validator<UserSchema>();

        let logs = await validator.validate(newUser);

        if (logs.length > 0)
            res.status(400).json({ success: false, data: logs });
        else {
            let existingUser = await this.database.GetUser(new Map([["username", newUser.username]]));

            if (existingUser !== null)
                res.status(400).json({ success: false, data: `username ${newUser.username} already exists` });
            else {
                let createdUser = await this.database.CreateUser(newUser);

                if (createdUser === null)
                    res.status(400).json({ success: false, data: newUser });
                else
                    res.status(200).json({ success: true, data: newUser });
            }
        }
    }

    updateUser = async (req: Request, res: Response) => {
        let userID = req.params.id;

        const newUser =
            new UserSchema(
                req.body.firstName,
                req.body.lastName,
                req.body.email,
                req.body.username,
                req.body.password,
            );

        const validator = new Validator<UserSchema>();

        let logs = (await validator.validate(newUser))
            .concat(await validator.validateObjectId(userID));

        if (logs.length > 0)
            res.status(400).json({ success: false, data: logs });
        else {
            let existingUser = await this.database.GetUser(new Map([["username", newUser.username]]));

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
