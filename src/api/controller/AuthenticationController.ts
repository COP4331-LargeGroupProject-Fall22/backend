import express, { Request, Response } from "express";
import { exit } from "process";
import { IUserDatabase } from "../../database/IUserDatabase";
import { Validator } from "../../utils/Validator";
import { UserSchema } from "../model/user/UserSchema";

export class AuthenticationController {
    private database: IUserDatabase;

    constructor(database: IUserDatabase) {
        this.database = database;
    }

    login = async (req: Request, res: Response) => {
        let existingUser : any = await this.database.GetUser(new Map([["uid", req.uid!]]));

        if (existingUser === null)
            res.status(400).json({ success: false, data: `user doesn't exists` });
        else 
            res.redirect(302, `/api/user/${existingUser._id}`);
    }

    register = async (req: Request, res: Response) => {
        const newUser =
            new UserSchema(
                req.body.firstName,
                req.body.lastName,
                req.uid === undefined ? "" : req.uid
            );

        const validator = new Validator<UserSchema>();

        let logs = await validator.validate(newUser);

        if (logs.length > 0)
            res.status(400).json({ success: false, data: logs });
        else {
            let existingUser = await this.database.GetUser(new Map([["uid", newUser.uid]]));

            if (existingUser !== null)
                res.status(400).json({ success: false, data: `uid ${newUser.uid} already exists` });
            else {
                let createdUser = await this.database.CreateUser(newUser);

                if (createdUser === null)
                    res.status(400).json({ success: false, data: newUser });
                else
                    res.status(200).json({ success: true, data: newUser });
            }
        }
    }
}
