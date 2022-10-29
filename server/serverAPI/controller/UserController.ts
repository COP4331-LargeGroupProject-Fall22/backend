import { Request, Response } from "express";
import IDatabase from '../../database/IDatabase';
import ResponseFormatter from "../../utils/ResponseFormatter";
import { ResponseTypes } from "../../utils/ResponseTypes";
import IBaseUser from "../model/user/IBaseUser";
import IDatabaseUser from "../model/user/IDatabaseUser";
import IUser from "../model/user/IUser";
import UserUpdateSchema from "../model/user/requestSchema/UserUpdateSchema";

/**
 * This class creates several properties responsible for user-actions 
 * provided to the user.
 */
export default class UserController {
    private database: IDatabase<IUser, IDatabaseUser>;

    constructor(database: IDatabase<IUser, IDatabaseUser>) {
        this.database = database;
    }

    private getException(error: unknown): string {
        if (error instanceof Error) {
            return error.message;
        }

        return String(error);
    }

    private convertToBaseUser(user: IDatabaseUser): IBaseUser {
        return {
            firstName: user.firstName,
            lastName: user.lastName,
            lastSeen: user.lastSeen
        };
    }

    private convertToUser(user: IDatabaseUser): IUser {
        return {
            firstName: user.firstName,
            lastName: user.lastName,
            lastSeen: user.lastSeen,
            username: user.username,
            password: user.password,
            inventory: user.inventory
        }
    }

    /**
     * Lets client to get information about all users existed on the server.
     * Upon successful operation, this handler will return all users (including their non-sensitive information) existed on the server. 
     * 
     * @param req Request parameter that holds information about request
     * @param res Response parameter that holds information about response
     */
    getUsers = async (req: Request, res: Response) => {
        this.database.GetAll().then(users => {
            let baseUsers: IBaseUser[] = [];

            users?.forEach(user => {
                baseUsers.push(this.convertToBaseUser(user));
            });

            return res.status(200)
                .json(ResponseFormatter.formatAsJSON(ResponseTypes.SUCCESS, baseUsers.length === 0 ? null : baseUsers));
        }, (error) => {
            return res.status(400)
                .json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, this.getException(error)));
        });
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
            ["_id", req.serverUser.id]
        ]);

        this.database.Get(parameters).then(user => {
            if (user === null) {
                return res.status(404)
                    .json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, "User hasn't been found."));
            }

            return res.status(200)
                .json(ResponseFormatter.formatAsJSON(ResponseTypes.SUCCESS, this.convertToUser(user)));
        }, (error) => {
            return res.status(400)
                .json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, this.getException(error)));
        });
    }

    private async isUnique(username: string): Promise<boolean> {
        return this.database.Get(new Map([["username", username]])).then(user => {
            if (user === null) {
                return true;
            }

            return false;
        });
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
            ["_id", req.serverUser.id]
        ]);

        return this.database.Get(parameters).then(async user => {
            if (user === null) {
                return res.status(404)
                    .json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, "User hasn't been found."));
            }

            if (req.body.username !== undefined) {
                let result = await this.isUnique(req.body.username);

                if (!result) {
                    return res.status(400)
                        .json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, "User with such username already exists."));
                }
            }

            let userSchema = new UserUpdateSchema(
                req.body.firstName === undefined ? user.firstName : req.body.firstName,
                req.body.lastName === undefined ? user.lastName : req.body.lastName,
                req.body.username === undefined ? user.username : req.body.username,
                req.body.password === undefined ? user.password : req.body.password,
                user.lastSeen,
            );

            let logs = await userSchema.validate();

            if (logs.length > 0) {
                return res.status(400)
                    .json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, logs));
            }

            let newUser: IUser = {
                inventory: user.inventory,
                firstName: user.firstName,
                lastName: user.lastName,
                lastSeen: user.lastSeen,
                password: user.password,
                username: user.username
            };

            return this.database.Update(req.serverUser.id, newUser).then(updatedUser => {
                if (updatedUser === null) {
                    return res.status(404)
                        .json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, "User couldn't been updated."));
                }

                return res.status(200)
                    .json(ResponseFormatter.formatAsJSON(ResponseTypes.SUCCESS, this.convertToUser(updatedUser)));
            }, (error) => {
                return res.status(400)
                    .json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, this.getException(error)));
            });
        }, (error) => {
            return res.status(400)
                .json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, this.getException(error)));
        });
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
            ["_id", req.serverUser.id]
        ]);

        return this.database.Get(parameters).then(user => {
            if (user === null) {
                return res.status(404)
                    .json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, "User hasn't been found."));
            }

            return this.database.Delete(req.serverUser.id).then(result => {
                if (!result) {
                    return res.status(404)
                        .json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, "Delete was unsuccessful."));
                }

                return res.status(200)
                    .json(ResponseFormatter.formatAsJSON(ResponseTypes.SUCCESS));

            }, (error) => {
                return res.status(400)
                    .json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, this.getException(error)));
            });
        }, (error) => {
            return res.status(400)
                .json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, this.getException(error)));
        });
    }
}
