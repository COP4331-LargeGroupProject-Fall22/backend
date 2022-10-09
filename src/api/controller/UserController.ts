import { Request, Response } from "express";
import { stringify } from "querystring";
import { IDatabase } from '../../database/IDatabase';
import { IUser } from "../model/user/IUser";

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

    postUser = (req: Request, res: Response) => {
        let {
            firstName,
            lastName,
            email,
            username,
            password
        } = req.body;

        const newUser: IUser = {
            firstName: firstName, 
            lastName: lastName, 
            email: email, 
            username: username, 
            password: password,
            lastSeen: Date.now().toString()
        };

        this.database.GetUser(new Map([["username", newUser.username]])).then(user => {
            if (user !== null)
                res.status(400).json({ success: false, data: null });
            else {
                this.database.CreateUser(newUser).then(newUser => {
                    if (newUser === null)
                        res.status(400).json({ success: false, data: newUser });
                    else
                        res.status(200).json({ success: true, data: newUser });
                })
            }
        });
    }

    updateUser = (req: Request, res: Response) => {
        let userID = req.params.id;

        let {
            firstName,
            lastName,
            email,
            username,
            password
        } = req.body;

        const newUser: IUser = {
            firstName: firstName, 
            lastName: lastName, 
            email: email, 
            username: username, 
            password: password,
            lastSeen: Date.now().toString()
        };

        this.database.GetUser(new Map([["username", newUser.username]])).then(user => {
            if (user === null)
                res.status(400).json({ success: false, data: null });
            else {
                this.database.UpdateUser(userID, newUser).then(newUser => {
                    res.status(200).json({ success: true, data: newUser });
                })
            }
        });
    }

    deleteUser = (req: Request, res: Response) => {
        let userID = req.params.id;

        this.database.DeleteUser(userID).then(result => {
            if (result)
                res.status(200).json({ success: true, data: null });
            else
                res.status(400).json({ success: false, data: null });
        })        
    }
}