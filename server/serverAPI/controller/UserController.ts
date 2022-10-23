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
     * This property is a handler that is used for "getUsers" action of the user.
     * It provides user with an ability to receive summary of non-sensitive information about all existing users in the database.
     * 
     * @param req Request parameter that holds information about request
     * @param res Response parameter that holds information about response
     */
    getUsers = async (req: Request, res: Response) => {
        this.database.GetUsers()
            .then((users: Partial<IUser>[] | null) => res.status(200).json(ResponseFormatter.formatAsJSON(ResponseTypes.SUCCESS, users)));
    }

    /**
     * This property is a handler that is used for "getUser" action of the user.
     * It provides user with an ability to receive their own information (complete information) from the database.
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

        res.status(200).json(ResponseFormatter.formatAsJSON(ResponseTypes.SUCCESS, user));
    }

    /**
     * This property is a handler that is used for "updateUser" action of the user.
     * It provides user with an ability to update their own information on the database.
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

        newUser.inventory = user.inventory;

        let updatedUser = await this.database.UpdateUser(userID, newUser);

        res.status(200).json(ResponseFormatter.formatAsJSON(ResponseTypes.SUCCESS, updatedUser));
    }

    /**
     * This property is a handler that is used for "deleteUser" action of the user.
     * It provides user with an ability to delete their own information from the database.
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
        let result = await this.database.DeleteUser(userID);

        if (!result) {
            res.status(404).json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, "Delete was unsuccessful."));
            return;
        }

        res.status(200).json(ResponseFormatter.formatAsJSON(ResponseTypes.SUCCESS));
    }

    /**
     * This property is a handler that is used for "getFoods" action of the user.
     * It provides user with an ability to retrieve information about their food inventory.
     * 
     * @param req Request parameter that holds information about request
     * @param res Response parameter that holds information about response
     */
    getFoods = async (req: Request, res: Response) => {
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

        res.status(200).json(ResponseFormatter.formatAsJSON(ResponseTypes.SUCCESS, user.inventory));
    }

    /**
    * This property is a handler that is used for "addFood" action of the user.
    * It provides user with an ability to add food to the inventory.
    * 
    * @param req Request parameter that holds information about request
    * @param res Response parameter that holds information about response
    */
    addFood = async (req: Request, res: Response) => {
        let userID = req.params.userID;

        if (req.body.nutrients == undefined) {
            res.status(404).json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, "Nutrition is not part of the payload."));
            return;
        }

        let parsedNutrients = JSON.parse(req.body.nutrients);

        let nutrients: NutrientSchema[] = [];

        parsedNutrients.forEach((nutrient: any) => {
            nutrients.push(new NutrientSchema(
                nutrient?.name,
                new UnitSchema(
                    nutrient?.unit?.unit,
                    nutrient?.unit?.value
                ),
                nutrient?.percentOfDaily
            ));
        });

        const newFood =
            new FoodItemSchema(
                Number.parseInt(req.body.id),
                req.body.name,
                req.body.category,
                nutrients,
                Number.parseFloat(req.body.expirationDate)
            );


        const validator = new Validator();

        let logs = (await validator.validateObjectId(userID))
            .concat(await validator.validate(newFood))

        if (logs.length > 0) {
            res.status(400).json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, logs));
            return;
        }

        let parameters = new Map<string, any>([
            ["_id", userID]
        ]);

        let user = await this.database.GetUser(parameters);

        if (user === null) {
            res.status(404).json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, "User hasn't been found"));
            return;
        }

        let food = user.inventory.find((foodItem: IFoodItem) => foodItem.id === newFood.id);

        if (food !== undefined) {
            res.status(400).json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, "Food item already exists in inventory"));
            return;
        }

        user.inventory.push(newFood);

        let updatedUser = await this.database.UpdateUser(userID, user);

        if (updatedUser === null) {
            res.status(400).json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, "Food item could not be added. User update error."));
            return;
        }

        res.status(200).json(ResponseFormatter.formatAsJSON(ResponseTypes.SUCCESS, updatedUser.inventory));
    }

    /**
    * This property is a handler that is used for "getFood" action of the user.
    * It provides user with an ability to retrieve information about specific food in their inventory.
    * 
    * @param req Request parameter that holds information about request
    * @param res Response parameter that holds information about response
    */
    getFood = async (req: Request, res: Response) => {
        let userID = req.params.userID;
        let foodID = req.params.foodID

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

        let foodItem = user.inventory.find((foodItem: IFoodItem) => foodItem.id === Number.parseInt(foodID));

        if (foodItem === undefined) {
            res.status(400).json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, "Food item doesn't exist in inventory."));
            return;
        }

        res.status(200).json(ResponseFormatter.formatAsJSON(ResponseTypes.SUCCESS, foodItem));
    }

    /**
    * This property is a handler that is used for "updateFood" action of the user.
    * It provides user with an ability to update food in the user's inventory.
    * 
    * @param req Request parameter that holds information about request
    * @param res Response parameter that holds information about response
    */
    updateFood = async (req: Request, res: Response) => {
        let userID = req.params.userID;
        let foodID = Number.parseInt(req.params.foodID);

        if (req.body.nutrients == undefined) {
            res.status(404).json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, "Nutrition is not part of the payload."));
            return;
        }

        let parsedNutrients = JSON.parse(req.body.nutrients);

        let nutrients: NutrientSchema[] = [];

        parsedNutrients.forEach((nutrient: any) => {
            nutrients.push(new NutrientSchema(
                nutrient?.name,
                new UnitSchema(
                    nutrient?.unit?.unit,
                    nutrient?.unit?.value
                ),
                nutrient?.percentOfDaily
            ));
        });

        const newFood =
            new FoodItemSchema(
                foodID,
                req.body.name,
                req.body.category,
                nutrients,
                Number.parseFloat(req.body.expirationDate)
            );

        const validator = new Validator();

        let logs = (await validator.validateObjectId(userID))
            .concat(await validator.validate(newFood))

        if (logs.length > 0) {
            res.status(400).json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, logs));
            return;
        }

        let parameters = new Map([
            ["_id", userID]
        ]);

        let user = await this.database.GetUser(parameters);

        if (user === null) {
            res.status(404).json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, "User hasn't been found."));
            return;
        }

        let inventory = user.inventory;

        let isFound: boolean = false;

        let newInventory: IFoodItem[] = [];

        for (let i = 0; i < inventory.length; i++) {
            let foodToAdd = inventory[i];

            if (inventory[i].id === foodID) {
                isFound = true;
                foodToAdd = newFood;
            }

            newInventory.push(foodToAdd);
        }

        if (!isFound) {
            res.status(404).json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR));
            return;
        }

        user!.inventory = newInventory;

        let updatedUser = await this.database.UpdateUser(userID, user!);

        if (updatedUser === null) {
            res.status(400).json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, "Food item could not be updated. User update error."));
            return;
        }

        res.status(200).json(ResponseFormatter.formatAsJSON(ResponseTypes.SUCCESS, updatedUser.inventory));
    }

    /**
    * This property is a handler that is used for "deleteFood" action of the user.
    * It provides user with an ability to delete specific food from their inventory.
    * 
    * @param req Request parameter that holds information about request
    * @param res Response parameter that holds information about response
    */
    deleteFood = async (req: Request, res: Response) => {
        let userID = req.params.userID;
        let foodID = Number.parseInt(req.params.foodID);

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
            res.status(404).json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, logs));
            return;
        }

        let inventory = user.inventory;

        let isFound: boolean = false;

        let newInventory: IFoodItem[] = [];

        for (let i = 0; i < inventory.length; i++) {
            if (inventory[i].id === foodID) {
                isFound = true;
            }
            else {
                newInventory.push(inventory[i]);
            }
        }

        if (!isFound) {
            res.status(404).json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, "Food item doesn't exist in inventory"));
            return;
        }

        user.inventory = newInventory;

        let updatedUser = await this.database.UpdateUser(userID, user);

        if (updatedUser === null) {
            res.status(400).json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, "Food item could not be updated. User update error."));
            return;
        }

        res.status(200).json(ResponseFormatter.formatAsJSON(ResponseTypes.SUCCESS, updatedUser.inventory));
    }
}
