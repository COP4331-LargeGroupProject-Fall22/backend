import { Request, Response } from "express";
import IDatabase from "../../database/IDatabase";
import ResponseFormatter from "../../utils/ResponseFormatter";
import { ResponseTypes } from "../../utils/ResponseTypes";
import IFoodItem from "../model/food/IFoodItem";
import INutrient from "../model/nutrients/INutrient";
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

    private getException(error: unknown): string {
        if (error instanceof Error) {
            return error.message;
        }

        return String(error);
    }

    /**
     * Lets client to get all foods in user's inventory where user is at specified userID.
     * Upon successful operation, this handler will return all food items in user's inventory.
     * 
     * @param req Request parameter that holds information about request
     * @param res Response parameter that holds information about response
     */
    getFoods = async (req: Request, res: Response) => {
        let parameters = new Map<String, any>([
            ["_id", req.params.userID]
        ]);

        let user: IUser | null;
        try {
            user = await this.database.GetUser(parameters);
        } catch (error) {
            res.status(400).json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, this.getException(error)));
            return;
        }

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
        let parameters = new Map<string, any>([
            ["_id", req.params.userID]
        ]);

        let user: IUser | null;
        try {
            user = await this.database.GetUser(parameters);
        } catch (error) {
            res.status(400).json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, this.getException(error)));
            return;
        }

        if (user === null) {
            res.status(404).json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, "User hasn't been found"));
            return;
        }

        let nutrients: string = req.body.nutrients;

        if (nutrients.at(0) !== '[') {
            nutrients = "[" + nutrients + "]";
        }

        let newFood: IFoodItem = {
            id: Number.parseInt(req.body?.id),
            name: req.body?.name,
            category: req.body?.category,
            nutrients: JSON.parse(nutrients),
            expirationDate: Number.parseFloat(req.body?.expirationDate)
        };

        let duplicateFood = user.inventory.find((foodItem: IFoodItem) => foodItem.id === newFood.id);

        if (duplicateFood !== undefined) {
            res.status(400).json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, "Food item already exists in inventory"));
            return;
        }

        user.inventory.push(newFood);

        let updatedUser
        try {
            updatedUser = await this.database.UpdateUser(req.params.userID, user);
        } catch (error) {
            res.status(400).json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, this.getException(error)));
            return;
        }

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
        let parameters = new Map<String, any>([
            ["_id", req.params.userID]
        ]);

        let user: IUser | null;
        try {
            user = await this.database.GetUser(parameters);
        } catch (error) {
            res.status(400).json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, this.getException(error)));
            return;
        }

        if (user === null) {
            res.status(404).json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, "User hasn't been found."));
            return;
        }

        let foodItem = user.inventory.find((foodItem: IFoodItem) => foodItem.id === Number.parseInt(req.params.foodID));

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
        let parameters = new Map([
            ["_id", req.params.userID]
        ]);

        let user: IUser | null;
        try {
            user = await this.database.GetUser(parameters);
        } catch (error) {
            res.status(400).json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, this.getException(error)));
            return;
        }

        if (user === null) {
            res.status(404).json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, "User hasn't been found."));
            return;
        }

        let inventory = user.inventory;

        let isFound: boolean = false;

        let newInventory: IFoodItem[] = [];

        for (let i = 0; i < inventory.length; i++) {
            let foodToAdd = inventory[i];

            if (inventory[i].id === Number.parseInt(req.params.foodID)) {
                isFound = true;

                let nutrients: string = req.body.nutrients;

                if (nutrients.at(0) !== '[') {
                    nutrients = "[" + nutrients + "]";
                }

                foodToAdd = {
                    id: Number.parseInt(req.params.foodID),
                    name: req.body.name === undefined ? foodToAdd.name : req.body.name,
                    category: req.body.category === undefined ? foodToAdd.category : req.body.category,
                    nutrients: JSON.parse(nutrients),
                    expirationDate: Number.parseFloat(req.body.expirationDate)
                };
            }

            newInventory.push(foodToAdd);
        }

        if (!isFound) {
            res.status(404).json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, "Food Item hasn't been found."));
            return;
        }

        user.inventory = newInventory;

        let updatedUser: IUser | null;
        try {
            updatedUser = await this.database.UpdateUser(req.params.userID, user);
        } catch (error) {
            res.status(400).json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, this.getException(error)));
            return;
        }

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
        let parameters = new Map<String, any>([
            ["_id", req.params.userID]
        ]);

        let user: IUser | null;
        try {
            user = await this.database.GetUser(parameters);
        } catch (error) {
            res.status(400).json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, this.getException(error)));
            return;
        }

        if (user === null) {
            res.status(404).json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, "User hasn't been found."));
            return;
        }

        let inventory = user.inventory;

        let isFound: boolean = false;

        let newInventory: IFoodItem[] = [];

        for (let i = 0; i < inventory.length; i++) {
            if (inventory[i].id === Number.parseInt(req.params.foodID)) {
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

        let updatedUser: IUser | null;
        try {
            updatedUser = await this.database.UpdateUser(req.params.userID, user);
        } catch (error) {
            res.status(400).json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, this.getException(error)));
            return;
        }

        if (updatedUser === null) {
            res.status(400).json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, "Food item could not be updated. User update error."));
            return;
        }

        res.status(200).json(ResponseFormatter.formatAsJSON(ResponseTypes.SUCCESS, updatedUser.inventory));
    }
}
