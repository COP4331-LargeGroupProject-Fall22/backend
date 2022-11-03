import { Request, response, Response } from "express";
import IDatabase from "../../database/IDatabase";
import IFoodAPI from "../../foodAPI/IFoodAPI";
import IIngredient from "../model/food/IIngredient";

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

        try {
            let user = await this.requestGet(parameters, res)
            return this.sendSuccess(200, res, user.inventory);
        } catch (e) {
            return e;
        }
    }

    /**
     * Adds food to user's inventory.
     * 
     * @param req Request parameter that holds information about request.
     * @param res Response parameter that holds information about response.
     */
    add = async (req: Request, res: Response) => {
        let parameters = new Map<string, any>([["username", req.serverUser.username]]);

        try {
            let user = await this.requestGet(parameters, res);

            let ingredientSchema = new InventoryIngredientSchema(
                Number.parseInt(req.body?.id),
                req.body?.name,
                req.body?.category,
                this.parseNutrients(req.body.nutrients),
                JSON.parse(req.body?.quantityUnits),
                Number.parseFloat(req.body?.expirationDate)
            );

            ingredientSchema.quantity = JSON.parse(req.body.quantity);

            ingredientSchema = await this.verifySchema(ingredientSchema, res);

            let duplicateFood = user.inventory.find((foodItem: IInventoryIngredient) => foodItem.id === ingredientSchema.id);

            if (duplicateFood !== undefined) {
                return this.sendError(400, res, "Ingredient already exists in inventory.");
            }

            user.inventory.push(ingredientSchema);

            let updatedUser = await this.requestUpdate(req.serverUser.username, user, res);
            return this.sendSuccess(200, res, updatedUser.inventory);
        } catch (e) {
            return e;
        }
    }

    /**
     * Gets complete informations of the food item from user's inventory.
     * 
     * @param req Request parameter that holds information about request
     * @param res Response parameter that holds information about response
     */
    get = async (req: Request, res: Response) => {
        let parameters = new Map<string, any>([["username", req.serverUser.username]]);

        try {
            let user = await this.requestGet(parameters, res)
            let ingredient = user.inventory
                .find((foodItem: IInventoryIngredient) => foodItem.id === Number.parseInt(req.params.foodID));

            if (ingredient === undefined) {
                return this.sendError(404, res, "Ingredient doesn't exist in inventory.");
            }

            return this.sendSuccess(200, res, ingredient);
        } catch (e) {
            return e;
        }
    }

    private async parseUpdateRequest(req: Request, res: Response, existingIngredient: IInventoryIngredient)
        : Promise<IInventoryIngredient> {
        let ingredientSchema = new InventoryIngredientSchema(
            existingIngredient.id,
            existingIngredient.name,
            existingIngredient.category,
            existingIngredient.nutrients,
            existingIngredient.quantityUnits,
            existingIngredient.expirationDate
        );

        ingredientSchema.quantity = existingIngredient.quantity

        if (!this.isStringUndefinedOrEmpty(req.body.quantity)) {
            let quantityObject = JSON.parse(req.body.quantity);

            let quantitySchema = new UnitSchema(
                quantityObject.unit,
                Number.parseFloat(quantityObject.value)
            );

            try {
                await this.verifySchema(quantitySchema, res);
                ingredientSchema.quantity = quantitySchema;
            } catch (e) {
                return Promise.reject(e);
            }
        }

        ingredientSchema.expirationDate = this.isStringUndefinedOrEmpty(req.body.expirationDate) ?
            existingIngredient.expirationDate : Number.parseFloat(req.body.expirationDate);

        return ingredientSchema;
    }

    /**
     * Updates information of the food item from user's inventory.
     * 
     * @param req Request parameter that holds information about request
     * @param res Response parameter that holds information about response
     */
    update = async (req: Request, res: Response) => {
        let parameters = new Map<string, any>([["username", req.serverUser.username]]);

        try {
            let user = await this.requestGet(parameters, res);

            let isFound: boolean = false;

            for (let i = 0; i < user.inventory.length; i++) {
                let existingIngredient = user.inventory[i];

                if (user.inventory[i].id === Number.parseInt(req.params.foodID)) {
                    isFound = true;

                    user.inventory[i] = await this.parseUpdateRequest(req, res, existingIngredient);

                    if (user.inventory[i].quantity !== existingIngredient.quantity) {
                        let updatedIngredient = await this.foodAPI.Get(
                            new Map<string, any>([
                                ["id", existingIngredient.id],
                                ["quantity", user.inventory[i].quantity!.value],
                                ["unit", user.inventory[i].quantity!.unit]
                            ]));

                        if (updatedIngredient !== null) {
                            user.inventory[i] = {
                                expirationDate: user.inventory[i].expirationDate,
                                nutrients: updatedIngredient.nutrients,
                                id: updatedIngredient.id,
                                name: updatedIngredient.name,
                                category: updatedIngredient.category,
                                quantityUnits: updatedIngredient.quantityUnits
                            };
                        }
                    }
                }
            }

            if (!isFound) {
                return this.sendError(404, res, "Ingredient could not be found.");
            }

            let updatedUser = await this.requestUpdate(req.serverUser.username, user, res);
            return this.sendSuccess(200, res, updatedUser.inventory);
        } catch (e) {
            return e;
        }
    }

    /**
     * Deletes food item from item from user's inventory.
     * 
     * @param req Request parameter that holds information about request.
     * @param res Response parameter that holds information about response.
     */
    delete = async (req: Request, res: Response) => {
        let parameters = new Map<string, any>([["username", req.serverUser.username]]);

        try {
            let user = await this.requestGet(parameters, res)
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

            let updatedUser = await this.requestUpdate(req.serverUser.username, user, res)
            return this.sendSuccess(200, res, updatedUser.inventory);
        } catch (e) {
            return e;
        }
    }
}
