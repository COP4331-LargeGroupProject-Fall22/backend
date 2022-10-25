import { Validator } from "../../utils/Validator";
import { Request, Response } from "express";
import IDatabase from '../../database/IDatabase';
import UserSchema from '../model/user/UserSchema';
import FoodItemSchema from "../model/food/FoodItemSchema";
import NutrientSchema from "../model/nutrients/NutrientSchema";
import UnitSchema from "../model/unit/UnitSchema";
import IFoodItem from "../model/food/IFoodItem";
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

    /**
     * Lets client to get information about all users existed on the server.
     * Upon successful operation, this handler will return all users (including their non-sensitive information) existed on the server. 
     * 
     * @param req Request parameter that holds information about request
     * @param res Response parameter that holds information about response
     */
    getUsers = async (req: Request, res: Response) => {
        this.database.GetUsers()
            .then((users: Partial<IUser>[] | null) => res.status(200).json(ResponseFormatter.formatAsJSON(ResponseTypes.SUCCESS, users)));
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
        let userID = req.params.userID;

        const validator = new Validator();

        let logs = await validator.validateObjectId(userID)

        if (logs.length > 0) {
            res.status(400).json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, logs));
            return;
        }

        let parameters = new Map<String, any>([
            ["_id", userID]
        ]);

        let user = await this.database.GetUser(parameters);

        if (user === null) {
            res.status(404).json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, "User hasn't been found."));
            return;
        }

        // if (user.uid !== req.params.uid) {
        //     res.status(400).json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, "Cannot access other people information."));
        //     return;
        // }

        res.status(200).json(ResponseFormatter.formatAsJSON(ResponseTypes.SUCCESS, user));
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
        let userID = req.params.userID;

        const newUser =
            new UserSchema(
                req.body?.firstName,
                req.body?.lastName,
                req.body?.uid
            );

        const validator = new Validator();

        let logs = (await validator.validate(newUser))
            .concat(await validator.validateObjectId(userID));

        if (logs.length > 0) {
            res.status(400).json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, logs));
            return;
        }

        let parameters = new Map<string, any>([
            ["_id", userID]
        ]);

        let user = await this.database.GetUser(parameters);

        if (user === null) {
            res.status(404).json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, "User hasn't been found."));
            return;
        }

        // if (user.uid !== req.params.uid) {
        //     res.status(400).json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, "Cannot access other people information."));
        //     return;
        // }

        newUser.inventory = user.inventory;

        let updatedUser = await this.database.UpdateUser(userID, newUser);

        res.status(200).json(ResponseFormatter.formatAsJSON(ResponseTypes.SUCCESS, updatedUser));
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
        let userID = req.params.userID;

        const validator = new Validator();

        let logs = await validator.validateObjectId(userID);

        if (logs.length > 0) {
            res.status(400).json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, logs));
            return;
        }

        let user = await this.database.GetUser(new Map([["_id", userID]]));

        if (user === null) {
            res.status(404).json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, "User hasn't been found."));
            return;
        }

        // if (user.uid !== req.params.uid) {
        //     res.status(400).json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, "Cannot access other people information."));
        //     return;
        // }

        let result = await this.database.DeleteUser(userID);

        if (!result) {
            res.status(404).json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, "Delete was unsuccessful."));
            return;
        }

        res.status(200).json(ResponseFormatter.formatAsJSON(ResponseTypes.SUCCESS));
    }
}
