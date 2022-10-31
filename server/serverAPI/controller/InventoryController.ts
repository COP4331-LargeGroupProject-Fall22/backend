import { Request, Response } from "express";
import IDatabase from "../../database/IDatabase";
import ResponseFormatter from "../../utils/ResponseFormatter";
import { ResponseTypes } from "../../utils/ResponseTypes";
import IInventoryIngredient from "../model/food/IInventoryIngredient";
import InventoryIngredientSchema from "../model/food/requestSchema/InventoryIngredientSchema";
import INutrient from "../model/nutrients/INutrient";
import IUser from "../model/user/IUser";
import BaseUserController from "./BaseUserController";

/**
 * This class creates several properties responsible for inventory actions 
 * provided to the user.
 */
export default class InventoryController extends BaseUserController {
    constructor(database: IDatabase<IUser>) {
        super(database);
    }

    private parseNutrients(req: Request): INutrient[] {
        let nutrients: string = req.body.nutrients === undefined ? "[]" : req.body.nutrients;

        if (nutrients.at(0) !== '[') {
            nutrients = "[" + nutrients + "]";
        }

        return JSON.parse(nutrients);
    }

    private async getIngredientFromRequest(req: Request, res: Response): Promise<IInventoryIngredient> {
        let nutrients = this.parseNutrients(req);

        let ingredientSchema = new InventoryIngredientSchema(
            Number.parseInt(req.body?.id),
            req.body?.name,
            req.body?.category,
            nutrients,
            Number.parseFloat(req.body?.expirationDate)
        );

        let logs = await ingredientSchema.validate();

        if (logs.length > 0) {
            return Promise.reject(res.status(400)
                .json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, logs)));
        }

        return Promise.resolve(ingredientSchema);
    }

    /**
     * Returns all food in user inventory for user specified by userID.
     * 
     * @param req Request parameter that holds information about request.
     * @param res Response parameter that holds information about response.
     */
    getAll = async (req: Request, res: Response) => {
        let parameters = new Map<string, any>([["username", req.serverUser.username]]);

        return this.requestGet(parameters, res).then(user => {
            return res.status(200).json(ResponseFormatter.formatAsJSON(ResponseTypes.SUCCESS, user.inventory));
        }, (response) => response);
    }

    /**
    * Adds food to user's inventory where user is at specified userID.
    * Upon successful operation, this handler will return all food items from user's inventory.
    * 
    * @param req Request parameter that holds information about request.
    * @param res Response parameter that holds information about response.
    */
    add = async (req: Request, res: Response) => {
        let parameters = new Map<string, any>([["username", req.serverUser.username]]);

        return this.requestGet(parameters, res).then(user => {
            return this.getIngredientFromRequest(req, res).then(ingredient => {
                let duplicateFood = user.inventory.find((foodItem: IInventoryIngredient) => foodItem.id === ingredient.id);

                if (duplicateFood !== undefined) {
                    return res.status(400)
                        .json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, "Ingredient already exists in inventory."));
                }

                user.inventory.push(ingredient);

                return this.requestUpdate(req.serverUser.username, user, res).then(updatedUser => {
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
        let parameters = new Map<string, any>([["username", req.serverUser.username]]);

        return this.requestGet(parameters, res).then(user => {
            let foodItem = user.inventory
                .find((foodItem: IInventoryIngredient) => foodItem.id === Number.parseInt(req.params.foodID));

            if (foodItem === undefined) {
                return res.status(400)
                    .json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, "Ingredient doesn't exist in inventory."));
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
        let parameters = new Map<string, any>([["username", req.serverUser.username]]);

        return this.requestGet(parameters, res).then(user => {
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
                        nutrients: nutrients,
                        expirationDate: Number.parseFloat(req.body.expirationDate)
                    };
                }

                console.log(foodToAdd);

                newInventory.push(foodToAdd);
            }

            if (!isFound) {
                return res.status(404)
                    .json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, "Ingredient could not be found."));
            }

            user.inventory = newInventory;

            return this.requestUpdate(req.serverUser.username, user, res).then(updatedUser => {
                return res.status(200)
                    .json(ResponseFormatter.formatAsJSON(ResponseTypes.SUCCESS, updatedUser.inventory));
            }, (response) => response);
        }, (response) => response);
    }

    /**
    * Deletes food item from item from user's inventory where user is at specified userID.
    * 
    * @param req Request parameter that holds information about request.
    * @param res Response parameter that holds information about response.
    */
    delete = async (req: Request, res: Response) => {
        let parameters = new Map<string, any>([["username", req.serverUser.username]]);

        return this.requestGet(parameters, res).then(user => {
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
                    .json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, "Ingredient doesn't exist in inventory."));
            }

            user.inventory = newInventory;

            return this.requestUpdate(req.serverUser.username, user, res).then(updatedUser => {
                return res.status(200)
                    .json(ResponseFormatter.formatAsJSON(ResponseTypes.SUCCESS, updatedUser.inventory));
            }, (response) => response);
        }, (response) => response);
    }
}
