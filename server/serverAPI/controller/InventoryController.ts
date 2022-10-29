import { Request, Response } from "express";
import IDatabase from "../../database/IDatabase";
import ResponseFormatter from "../../utils/ResponseFormatter";
import { ResponseTypes } from "../../utils/ResponseTypes";
import IInventoryIngredient from "../model/food/IInventoryIngredient";
import IDatabaseUser from "../model/user/IDatabaseUser";
import IUser from "../model/user/IUser";

/**
 * This class creates several properties responsible for inventory actions 
 * provided to the user.
 */
export default class InventoryController {
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

    /**
     * Lets client to get all foods in user's inventory where user is at specified userID.
     * Upon successful operation, this handler will return all food items in user's inventory.
     * 
     * @param req Request parameter that holds information about request
     * @param res Response parameter that holds information about response
     */
    getInventory = async (req: Request, res: Response) => {
        let parameters = new Map<String, any>([
            ["_id", req.serverUser.id]
        ]);

        return this.database.Get(parameters).then(user => {
            if (user === null) {
                return res.status(404)
                    .json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, "User hasn't been found."));
            }

            return res.status(200).json(ResponseFormatter.formatAsJSON(ResponseTypes.SUCCESS, user.inventory));
        }, (error) => {
            return res.status(400)
                .json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, this.getException(error)));
        });
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
            ["_id", req.serverUser.id]
        ]);

        return this.database.Get(parameters).then(user => {
            if (user === null) {
                return res.status(404)
                    .json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, "User hasn't been found"));
            }

            let nutrients: string = req.body.nutrients === undefined ? "[]" : req.body.nutrients;

            if (nutrients.at(0) !== '[') {
                nutrients = "[" + nutrients + "]";
            }

            let newFood: IInventoryIngredient = {
                id: Number.parseInt(req.body?.id),
                name: req.body?.name,
                category: req.body?.category,
                nutrients: JSON.parse(nutrients),
                expirationDate: Number.parseFloat(req.body?.expirationDate)
            };

            let duplicateFood = user.inventory.find((foodItem: IInventoryIngredient) => foodItem.id === newFood.id);

            if (duplicateFood !== undefined) {
                return res.status(400)
                    .json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, "Food item already exists in inventory"));
            }

            user.inventory.push(newFood);

            return this.database.Update(req.serverUser?.id!, user).then(updatedUser => {
                if (updatedUser === null) {
                    return res.status(400)
                        .json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, "Food item could not be added. User update error."));
                }

                return res.status(200)
                    .json(ResponseFormatter.formatAsJSON(ResponseTypes.SUCCESS, updatedUser.inventory));

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
     * Lets client to get complete informations of the food item from user's inventory where user is at specified userID.
     * Upon successful operation, this handler will return food item from user's inventory.
    * 
    * @param req Request parameter that holds information about request
    * @param res Response parameter that holds information about response
    */
    getFood = async (req: Request, res: Response) => {
        let parameters = new Map<String, any>([
            ["_id", req.serverUser.id]
        ]);

        this.database.Get(parameters).then(user => {
            if (user === null) {
                return res.status(404)
                    .json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, "User hasn't been found."));
            }

            let foodItem = user.inventory
                .find((foodItem: IInventoryIngredient) => foodItem.id === Number.parseInt(req.params.foodID));

            if (foodItem === undefined) {
                return res.status(400)
                    .json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, "Food item doesn't exist in inventory."));
            }

            return res.status(200)
                .json(ResponseFormatter.formatAsJSON(ResponseTypes.SUCCESS, foodItem));
        }, (error) => {
            return res.status(400)
                .json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, this.getException(error)));
        });
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
            ["_id", req.serverUser.id]
        ]);

        return this.database.Get(parameters).then(user => {
            if (user === null) {
                return res.status(404)
                    .json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, "User hasn't been found."));
            }

            let isFound: boolean = false;

            let newInventory: IInventoryIngredient[] = [];

            for (let i = 0; i < user.inventory.length; i++) {
                let foodToAdd = user.inventory[i];

                if (user.inventory[i].id === Number.parseInt(req.params.foodID)) {
                    isFound = true;

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
                return res.status(404)
                    .json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, "Food Item hasn't been found."));
            }

            user.inventory = newInventory;

            return this.database.Update(req.serverUser.id, user).then(updatedUser => {
                if (updatedUser === null) {
                    return res.status(400)
                        .json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, "Food item could not be updated. User update error."));
                }

                return res.status(200)
                    .json(ResponseFormatter.formatAsJSON(ResponseTypes.SUCCESS, updatedUser.inventory));
            }, (error) => {
                return res.status(400).json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, this.getException(error)));
            });
        }, (error) => {
            return res.status(400)
                .json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, this.getException(error)));
        });
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
            ["_id", req.serverUser.id]
        ]);

        this.database.Get(parameters).then(user => {
            if (user === null) {
                return res.status(404)
                    .json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, "User hasn't been found."));
            }

            let isFound: boolean = false;

            let newInventory: IInventoryIngredient[] = [];

            for (let i = 0; i < user.inventory.length; i++) {
                if (user.inventory[i].id === Number.parseInt(req.params.foodID)) {
                    isFound = true;
                }
                else {
                    newInventory.push(user.inventory[i]);
                }
            }

            if (!isFound) {
                return res.status(404)
                    .json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, "Food item doesn't exist in inventory"));
            }

            user.inventory = newInventory;

            this.database.Update(req.serverUser.id, user).then(updatedUser => {
                if (updatedUser === null) {
                    return res.status(400)
                        .json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, "Food item could not be updated. User update error."));
                }

                return res.status(200)
                    .json(ResponseFormatter.formatAsJSON(ResponseTypes.SUCCESS, updatedUser.inventory));
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
