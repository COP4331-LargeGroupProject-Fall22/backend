import { Request, Response } from "express";
import IDatabase from "../../database/IDatabase";
import ResponseFormatter from "../../utils/ResponseFormatter";
import { ResponseTypes } from "../../utils/ResponseTypes";
import { Validator } from "../../utils/Validator";
import FoodItemSchema from "../model/food/FoodItemSchema";
import IFoodItem from "../model/food/IFoodItem";
import NutrientSchema from "../model/nutrients/NutrientSchema";
import UnitSchema from "../model/unit/UnitSchema";
import IUser from "../model/user/IUser";

/**
 * This class creates several properties responsible for inventory actions 
 * provided to the user.
 */
export default class InventoryController {
    private database: IDatabase<IUser>;

    constructor(database: IDatabase<IUser>) {
        this.database = database;
    }
    
    /**
     * Lets client to get all foods in user's inventory where user is at specified userID.
     * Upon successful operation, this handler will return all food items in user's inventory.
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
    * Lets client to add food to user's inventory where user is at specified userID.
    * Upon successful operation, this handler will return all food items from user's inventory.
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
     * Lets client to get complete informations of the food item from user's inventory where user is at specified userID.
     * Upon successful operation, this handler will return food item from user's inventory.
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
     * Lets client to update information of the food item from user's inventory where user is at specified userID.
     * Upon successful operation, this handler will return all food items in user's inventory.
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
    * Lets client to delete food item from user's inventory where user is at specified userID.
    * Upon successful operation, this handler will return all food items in user's inventory.
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
