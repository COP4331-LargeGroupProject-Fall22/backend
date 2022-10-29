import { Request, Response } from "express";
import IDatabase from "../../database/IDatabase";
import ResponseFormatter from "../../utils/ResponseFormatter";
import { ResponseTypes } from "../../utils/ResponseTypes";
import IFoodItem from "../model/food/IFoodItem";
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
     * Returns all food in user inventory for user specified by userID.
     * 
     * @param req Request parameter that holds information about request.
     * @param res Response parameter that holds information about response.
     */
    getInventory = async (req: Request, res: Response) => {
        let parameters = new Map<String, any>([
            ["_id", req.params.userID]
        ]);

        let user: IUser | null;
        try {
            user = await this.database.GetUser(parameters);
        } catch (error) {
            res.status(400)
                .json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, this.getException(error)));
            return;
        }

        if (user === null) {
            res.status(404)
                .json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, "User hasn't been found."));
            return;
        }

        res.status(200)
            .json(ResponseFormatter.formatAsJSON(ResponseTypes.SUCCESS, user.inventory));
    }

    /**
    * Adds food to user's inventory where user is at specified userID.
    * Upon successful operation, this handler will return all food items from user's inventory.
    * 
    * @param req Request parameter that holds information about request.
    * @param res Response parameter that holds information about response.
    */
    addFood = async (req: Request, res: Response) => {
        let parameters = new Map<string, any>([
            ["_id", req.params.userID]
        ]);

        let user: IUser | null;
        try {
            user = await this.database.GetUser(parameters);
        } catch (error) {
            res.status(400)
                .json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, this.getException(error)));
            return;
        }

        if (user === null) {
            res.status(404)
                .json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, "User hasn't been found"));
            return;
        }

        let nutrients: string = req.body.nutrients === undefined ? "[]" : req.body.nutrients;

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
            res.status(400)
                .json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, "Food item already exists in inventory"));
            return;
        }

        user.inventory.push(newFood);

        let updatedUser: IUser | null;
        try {
            updatedUser = await this.database.UpdateUser(req.params.userID, user);
        } catch (error) {
            res.status(400)
                .json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, this.getException(error)));
            return;
        }

        if (updatedUser === null) {
            res.status(400).
                json(ResponseFormatter
                    .formatAsJSON(ResponseTypes.ERROR, "Food item could not be added. User update error."));
            return;
        }

        res.status(200).json(ResponseFormatter.formatAsJSON(ResponseTypes.SUCCESS, updatedUser.inventory));
    }

    /**
     * Returns complete information for food item in user inventory specified by userID and foodID.
     * 
     * @param req Request parameter that holds information about request.
     * @param res Response parameter that holds information about response.
     */
    getFood = async (req: Request, res: Response) => {
        let parameters = new Map<String, any>([
            ["_id", req.params.userID]
        ]);

        let user: IUser | null;
        try {
            user = await this.database.GetUser(parameters);
        } catch (error) {
            res.status(400)
                .json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, this.getException(error)));
            return;
        }

        if (user === null) {
            res.status(404)
                .json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, "User hasn't been found."));
            return;
        }

        let foodItem = user.inventory.find((foodItem: IFoodItem) => foodItem.id === Number.parseInt(req.params.foodID));

        if (foodItem === undefined) {
            res.status(400)
                .json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, "Food item doesn't exist in inventory."));
            return;
        }

        res.status(200)
            .json(ResponseFormatter.formatAsJSON(ResponseTypes.SUCCESS, foodItem));
    }

    /**
     * Updates information about food item specified by userID and foodID.
     * 
     * @param req Request parameter that holds information about request.
     * @param res Response parameter that holds information about response.
     */
    updateFood = async (req: Request, res: Response) => {
        let parameters = new Map([
            ["_id", req.params.userID]
        ]);

        let user: IUser | null;
        try {
            user = await this.database.GetUser(parameters);
        } catch (error) {
            res.status(400)
                .json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, this.getException(error)));
            return;
        }

        if (user === null) {
            res.status(404)
                .json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, "User hasn't been found."));
            return;
        }

        let isFound: boolean = false;

        let newInventory: IFoodItem[] = [];

        for (let i = 0; i < user.inventory.length; i++) {
            let foodToAdd = user.inventory[i];

            if (user.inventory[i].id === Number.parseInt(req.params.foodID)) {
                isFound = true;

                // TODO(#58): typesafety and optimization of operations on inventory items
                let nutrients: string = req.body.nutrients === undefined ? "[]" : req.body.nutrients;

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
            res.status(404)
                .json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR,
                    "Can't update food item that isn't in inventory. Please use AddFood endpoint instead."));
            return;
        }

        user.inventory = newInventory;

        let updatedUser: IUser | null;
        try {
            updatedUser = await this.database.UpdateUser(req.params.userID, user);
        } catch (error) {
            res.status(400)
                .json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, this.getException(error)));
            return;
        }

        if (updatedUser === null) {
            res.status(400)
                .json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, "There was an error updating the user inventory."));
            return;
        }

        res.status(200)
            .json(ResponseFormatter.formatAsJSON(ResponseTypes.SUCCESS, updatedUser.inventory));
    }

    /**
    * Deletes food item from item from user's inventory where user is at specified userID.
    * 
    * @param req Request parameter that holds information about request.
    * @param res Response parameter that holds information about response.
    */
    deleteFood = async (req: Request, res: Response) => {
        let parameters = new Map<String, any>([
            ["_id", req.params.userID]
        ]);

        let user: IUser | null;
        try {
            user = await this.database.GetUser(parameters);
        } catch (error) {
            res.status(400)
                .json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, this.getException(error)));
            return;
        }

        if (user === null) {
            res.status(404)
                .json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, "User hasn't been found."));
            return;
        }

        let inventory = user.inventory;

        let isFound: boolean = false;

        let newInventory: IFoodItem[] = [];

        // TODO(#58): typesafety and optimization of operations on inventory items
        for (let i = 0; i < inventory.length; i++) {
            if (inventory[i].id === Number.parseInt(req.params.foodID)) {
                isFound = true;
            }
            else {
                newInventory.push(inventory[i]);
            }
        }

        if (!isFound) {
            res.status(404)
                .json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, "Food item doesn't exist in inventory"));
            return;
        }

        user.inventory = newInventory;

        let updatedUser: IUser | null;
        try {
            updatedUser = await this.database.UpdateUser(req.params.userID, user);
        } catch (error) {
            res.status(400)
                .json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, this.getException(error)));
            return;
        }

        if (updatedUser === null) {
            res.status(400)
                .json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, "There was an error updating the user inventory."));
            return;
        }

        res.status(200)
            .json(ResponseFormatter.formatAsJSON(ResponseTypes.SUCCESS, updatedUser.inventory));
    }
}
