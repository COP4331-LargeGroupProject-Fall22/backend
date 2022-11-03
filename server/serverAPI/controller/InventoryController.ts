import { Request, response, Response } from "express";
import IDatabase from "../../database/IDatabase";
import IFoodAPI from "../../foodAPI/IFoodAPI";

import IInventoryIngredient from "../model/food/IInventoryIngredient";
import InventoryIngredientSchema from "../model/food/requestSchema/InventoryIngredientSchema";
import INutrient from "../model/nutrients/INutrient";
import IUnit from "../model/unit/IUnit";
import UnitSchema from "../model/unit/UnitSchema";
import IUser from "../model/user/IUser";
import BaseUserController from "./BaseUserController";

/**
 * This class creates several properties responsible for inventory actions 
 * provided to the user.
 */
export default class InventoryController extends BaseUserController {
    private foodAPI: IFoodAPI;

    constructor(database: IDatabase<IUser>, foodAPI: IFoodAPI) {
        super(database);
        this.foodAPI = foodAPI;
    }

    private parseNutrients(data: any): INutrient[] {
        let nutrients: string = data === undefined ? "[]" : data;

        if (nutrients.charAt(0) !== '[') {
            nutrients = "[" + nutrients + "]";
        }

        return JSON.parse(nutrients);
    }

    /**
     * Returns all food in user inventory.
     * 
     * @param req Request parameter that holds information about request.
     * @param res Response parameter that holds information about response.
     */
    getAll = async (req: Request, res: Response) => {
        let parameters = new Map<string, any>([["username", req.serverUser.username]]);

        return this.requestGet(parameters, res).then(user => {
            return this.sendSuccess(200, res, user.inventory);
        }, (response) => response);
    }

    /**
     * Adds food to user's inventory.
     * 
     * @param req Request parameter that holds information about request.
     * @param res Response parameter that holds information about response.
     */
    add = async (req: Request, res: Response) => {
        let parameters = new Map<string, any>([["username", req.serverUser.username]]);

        return this.requestGet(parameters, res).then(async user => {
            let nutrients = this.parseNutrients(req.body.nutrients);

            let ingredientSchema = new InventoryIngredientSchema(
                Number.parseInt(req.body?.id),
                req.body?.name,
                req.body?.category,
                nutrients,
                req.body?.quantityUnits,
                Number.parseFloat(req.body?.expirationDate)
            );

            ingredientSchema.quantity = req.body?.quantity;

            return this.verifySchema(ingredientSchema, res).then(ingredientSchema => {
                let duplicateFood = user.inventory.find((foodItem: IInventoryIngredient) => foodItem.id === ingredientSchema.id);

                if (duplicateFood !== undefined) {
                    return this.sendError(400, res, "Ingredient already exists in inventory.");
                }

                user.inventory.push(ingredientSchema);

                return this.requestUpdate(req.serverUser.username, user, res).then(updatedUser => {
                    return this.sendSuccess(200, res, updatedUser.inventory);
                }, (response) => response);
            }, (response) => response);
        }, (response) => response);
    }

    /**
     * Gets complete informations of the food item from user's inventory.
     * 
     * @param req Request parameter that holds information about request
     * @param res Response parameter that holds information about response
     */
    get = async (req: Request, res: Response) => {
        let parameters = new Map<string, any>([["username", req.serverUser.username]]);

        return this.requestGet(parameters, res).then(user => {
            let ingredient = user.inventory
                .find((foodItem: IInventoryIngredient) => foodItem.id === Number.parseInt(req.params.foodID));

            if (ingredient === undefined) {
                return this.sendError(404, res, "Ingredient doesn't exist in inventory.");
            }

            return this.sendSuccess(200, res, ingredient);
        }, (response) => response);
    }

    /**
     * Updates information of the food item from user's inventory.
     * 
     * @param req Request parameter that holds information about request
     * @param res Response parameter that holds information about response
     */
    update = async (req: Request, res: Response) => {
        let parameters = new Map<string, any>([["username", req.serverUser.username]]);

        return this.requestGet(parameters, res).then(async user => {
            let isFound: boolean = false;

            let newInventory: IInventoryIngredient[] = [];

            for (let i = 0; i < user.inventory.length; i++) {
                let ingredientToAdd = user.inventory[i];

                if (user.inventory[i].id === Number.parseInt(req.params.foodID)) {
                    isFound = true;

                    let ingredient = Promise.resolve(ingredientToAdd);

                    let nutrients = ingredientToAdd.nutrients;
                    let quantity: Promise<IUnit | undefined> = Promise.resolve(ingredientToAdd.quantity);

                    if (!this.isStringUndefinedOrEmpty(req.body.quantity)) {
                        let quantitySchema = new UnitSchema(
                            req.body.quantity.unit,
                            Number.parseFloat(req.body.quantity.value)
                        );
                        
                        this.verifySchema(quantitySchema, res).then(async quantitySchema => {
                            return this.foodAPI.Get(new Map<string, any>([
                                ["id", ingredientToAdd.id],
                                ["quantity", quantitySchema.value],
                                ["unit", quantitySchema.unit]
                            ])).then(updatedIngredient => {
      
                            }, (error) => this.sendError(400, res, this.getException(error)));
                        }, (response) => response)


                       

                    }

                    ingredientToAdd = {
                        id: Number.parseInt(req.params.foodID),
                        name: ingredientToAdd.name,
                        category: ingredientToAdd.category,
                        nutrients: ingredientToAdd.nutrients,
                        quantityUnits: ingredientToAdd.quantityUnits,
                        quantity: this.isStringUndefinedOrEmpty(req.body.quantity) ?
                            ingredientToAdd.quantity : req.body.quantity,
                        expirationDate: this.isStringUndefinedOrEmpty(req.body.expirationDate) ?
                            ingredientToAdd.expirationDate : Number.parseFloat(req.body.expirationDate)
                    };
                }

                newInventory.push(ingredientToAdd);
            }

            if (!isFound) {
                return this.sendError(404, res, "Ingredient could not be found.");
            }

            user.inventory = newInventory;

            return this.requestUpdate(req.serverUser.username, user, res).then(updatedUser => {
                return this.sendSuccess(200, res, updatedUser.inventory);
            }, (response) => response);
        }, (response) => response);
    }

    /**
     * Deletes food item from item from user's inventory.
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
                } else {
                    newInventory.push(user.inventory[i]);
                }
            }

            if (!isFound) {
                return this.sendError(404, res, "Ingredient doesn't exist in inventory.");
            }

            user.inventory = newInventory;

            return this.requestUpdate(req.serverUser.username, user, res).then(updatedUser => {
                return this.sendSuccess(200, res, updatedUser.inventory);
            }, (response) => response);
        }, (response) => response);
    }
}
