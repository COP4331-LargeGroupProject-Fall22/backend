import { Request, response, Response } from "express";
import IDatabase from "../../database/IDatabase";
import ResponseFormatter from "../../utils/ResponseFormatter";
import { ResponseTypes } from "../../utils/ResponseTypes";
import IInventoryIngredient from "../model/food/IInventoryIngredient";
import IngredientSchema from "../model/food/requestSchema/IngredientSchema";
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

    private parseNutrients(req: Request): string {
        let nutrients: string = req.body.nutrients === undefined ? "[]" : req.body.nutrients;

        if (nutrients.at(0) !== '[') {
            nutrients = "[" + nutrients + "]";
        }

        return nutrients;
    }

    private async getUser(req: Request, res: Response): Promise<IUser> {
        let parameters = new Map<string, any>([
            ["username", req.serverUser.username]
        ]);

        return this.database.Get(parameters).then(user => {
            if (user === null) {
                return Promise.reject(res.status(404)
                    .json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, "User hasn't been found")));
            }

            return Promise.resolve(user);
        }, (error) => {
            return Promise.reject(res.status(400)
                .json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, this.getException(error))));
        });
    }

    private async validateIngredient(req: Request, res: Response): Promise<IInventoryIngredient> {
        let nutrients = this.parseNutrients(req);

        let ingredientSchema = new IngredientSchema(
            Number.parseInt(req.body?.id),
            req.body?.name,
            req.body?.category,
            JSON.parse(nutrients),
            Number.parseFloat(req.body?.expirationDate)
        );

        let logs = await ingredientSchema.validate();

        if (logs.length > 0) {
            return Promise.reject(res.status(400)
                .json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, logs)));
        }

        return Promise.resolve(ingredientSchema);
    }

    private async updateUser(req: Request, res: Response, user: IUser): Promise<IUser> {
        return this.database.Update(req.serverUser.username, user).then(updatedUser => {
            if (updatedUser === null) {
                return Promise.reject(res.status(400)
                    .json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, "Food item could not be added. User update error.")));
            }

            return Promise.resolve(updatedUser);
        }, (error) => {
            return Promise.reject(res.status(400)
                .json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, this.getException(error))));
        });
    }

    /**
     * Lets client to get all foods in user's inventory where user is at specified userID.
     * Upon successful operation, this handler will return all food items in user's inventory.
     * 
     * @param req Request parameter that holds information about request
     * @param res Response parameter that holds information about response
     */
    getAll = async (req: Request, res: Response) => {
        return this.getUser(req, res).then(user => {
            return res.status(200).json(ResponseFormatter.formatAsJSON(ResponseTypes.SUCCESS, user.inventory));
        }, (response) => response);
    }

    /**
    * Lets client to add food to user's inventory where user is at specified userID.
    * Upon successful operation, this handler will return all food items from user's inventory.
    * 
    * @param req Request parameter that holds information about request
    * @param res Response parameter that holds information about response
    */
    add = async (req: Request, res: Response) => {
        return this.getUser(req, res).then(user => {
            return this.validateIngredient(req, res).then(ingredient => {
                let duplicateFood = user.inventory.find((foodItem: IInventoryIngredient) => foodItem.id === ingredient.id);

                if (duplicateFood !== undefined) {
                    return res.status(400)
                        .json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, "Food item already exists in inventory"));
                }

                user.inventory.push(ingredient);

                return this.updateUser(req, res, user).then(updatedUser => {
                    return res.status(200)
                        .json(ResponseFormatter.formatAsJSON(ResponseTypes.SUCCESS, updatedUser.inventory));
                }, (response) => response);
            }, (response) => response)
        }, (response) => response);
    }

    /**
     * Lets client to get complete informations of the food item from user's inventory where user is at specified userID.
     * Upon successful operation, this handler will return food item from user's inventory.
    * 
    * @param req Request parameter that holds information about request
    * @param res Response parameter that holds information about response
    */
    get = async (req: Request, res: Response) => {
        return this.getUser(req, res).then(user => {
            let foodItem = user.inventory
                .find((foodItem: IInventoryIngredient) => foodItem.id === Number.parseInt(req.params.foodID));

            if (foodItem === undefined) {
                return res.status(400)
                    .json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, "Food item doesn't exist in inventory."));
            }

            return res.status(200)
                .json(ResponseFormatter.formatAsJSON(ResponseTypes.SUCCESS, foodItem));
        }, (response) => response);
    }

    /**
     * Lets client to update information of the food item from user's inventory where user is at specified userID.
     * Upon successful operation, this handler will return all food items in user's inventory.
    * 
    * @param req Request parameter that holds information about request
    * @param res Response parameter that holds information about response
    */
    update = async (req: Request, res: Response) => {
        return this.getUser(req, res).then(user => {
            let isFound: boolean = false;

            let newInventory: IInventoryIngredient[] = [];

            for (let i = 0; i < user.inventory.length; i++) {
                let foodToAdd = user.inventory[i];

                if (user.inventory[i].id === Number.parseInt(req.params.foodID)) {
                    isFound = true;

                    let nutrients = this.parseNutrients(req);

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

            return this.updateUser(req, res, user).then(updatedUser => {
                return res.status(200)
                    .json(ResponseFormatter.formatAsJSON(ResponseTypes.SUCCESS, updatedUser.inventory));
            }, (response) => response);
        }, (response) => response);
    }

    /**
    * Lets client to delete food item from user's inventory where user is at specified userID.
    * Upon successful operation, this handler will return all food items in user's inventory.
    * 
    * @param req Request parameter that holds information about request
    * @param res Response parameter that holds information about response
    */
    delete = async (req: Request, res: Response) => {
        return this.getUser(req, res).then(user => {
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

            return this.updateUser(req, res, user).then(updatedUser => {
                return res.status(200)
                    .json(ResponseFormatter.formatAsJSON(ResponseTypes.SUCCESS, updatedUser.inventory));
            }, (response) => response);
        }, (response) => response);
    }
}
