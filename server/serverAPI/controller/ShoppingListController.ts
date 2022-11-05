import { Request, Response } from "express";
import IDatabase from "../../database/IDatabase";
import IFoodAPI from "../../foodAPI/IFoodAPI";
import IIngredient from "../model/food/IIngredient";
import IShoppingIngredient from "../model/food/IShoppingIngredient";
import IngredientSchema from "../model/food/requestSchema/IngredientSchema";
import ShoppingIngredientSchema from "../model/food/requestSchema/ShoppingIngredient";

import UnitSchema from "../model/unit/UnitSchema";
import IUser from "../model/user/IUser";
import BaseUserController from "./BaseUserController";

/**
 * This class creates several properties responsible for inventory actions 
 * provided to the user.
 */
export default class ShoppingListController extends BaseUserController {
    private foodAPI: IFoodAPI;

    constructor(database: IDatabase<IUser>, foodAPI: IFoodAPI) {
        super(database);
        this.foodAPI = foodAPI;
    }

    private async parseAddRequest(req: Request, res: Response)
        : Promise<IShoppingIngredient> {
        let jsonPayload = req.body;
        let ingredientSchema = new ShoppingIngredientSchema(
            Number.parseInt(jsonPayload.id),
            jsonPayload.name,
            jsonPayload.category,
            jsonPayload.nutrients,
            jsonPayload.quantityUnits,
            jsonPayload.quantity,
            jsonPayload?.recipeID
        );

        try {
            ingredientSchema = await this.verifySchema(ingredientSchema, res);
        } catch (e) {
            return Promise.reject(e);
        }

        return ingredientSchema;
    }

    private async parseUpdateRequest(req: Request, res: Response, existingIngredient: IShoppingIngredient)
        : Promise<IShoppingIngredient> {
        let ingredientSchema = new ShoppingIngredientSchema(
            existingIngredient.id,
            existingIngredient.name,
            existingIngredient.category,
            existingIngredient.nutrients,
            existingIngredient.quantityUnits,
            existingIngredient.quantity,
            existingIngredient.recipeID
        );

        if (!this.isStringUndefinedOrEmpty(req.body.quantity)) {
            let quantityObject = req.body.quantity;

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

        return ingredientSchema;
    }

    /**
     * Returns all food in user shopping list.
     * 
     * @param req Request parameter that holds information about request.
     * @param res Response parameter that holds information about response.
     */
    getAll = async (req: Request, res: Response) => {
        let parameters = new Map<string, any>([["username", req.serverUser.username]]);

        try {
            let user = await this.requestGet(parameters, res)
            return this.sendSuccess(200, res, user.shoppingList);
        } catch (e) {
            return e;
        }
    }

    /**
     * Adds food to user's shopping list.
     * 
     * @param req Request parameter that holds information about request.
     * @param res Response parameter that holds information about response.
     */
    add = async (req: Request, res: Response) => {
        let parameters = new Map<string, any>([["username", req.serverUser.username]]);

        try {
            let user = await this.requestGet(parameters, res);

            let ingredientSchema = await this.parseAddRequest(req, res);

            let duplicateFood = user.shoppingList.find((foodItem: IShoppingIngredient) =>
                foodItem.id === ingredientSchema.id && foodItem.recipeID === ingredientSchema.recipeID
            );

            if (duplicateFood !== undefined) {
                return this.sendError(400, res, "Ingredient already exists in shopping list.");
            }

            user.shoppingList.push(ingredientSchema);

            let updatedUser = await this.requestUpdate(req.serverUser.username, user, res);
            return this.sendSuccess(200, res, updatedUser.shoppingList);
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
            let ingredient = user.shoppingList
                .find((foodItem: IShoppingIngredient) => foodItem.id === Number.parseInt(req.params.foodID));

            if (ingredient === undefined) {
                return this.sendError(404, res, "Ingredient doesn't exist in shopping list.");
            }

            return this.sendSuccess(200, res, ingredient);
        } catch (e) {
            return e;
        }
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
                let existingIngredient = user.shoppingList[i];

                if (user.shoppingList[i].id === Number.parseInt(req.params.foodID)) {
                    isFound = true;

                    user.shoppingList[i] = await this.parseUpdateRequest(req, res, existingIngredient);

                    if (user.shoppingList[i].quantity?.unit !== existingIngredient.quantity?.unit ||
                        user.shoppingList[i].quantity?.value !== existingIngredient.quantity?.value) {

                        let updatedIngredient = await this.foodAPI.Get(
                            new Map<string, any>([
                                ["id", existingIngredient.id],
                                ["quantity", user.shoppingList[i].quantity.value],
                                ["unit", user.shoppingList[i].quantity.unit]
                            ])
                        );

                        if (updatedIngredient !== null) {
                            user.shoppingList[i] = {
                                nutrients: updatedIngredient.nutrients,
                                id: updatedIngredient.id,
                                name: updatedIngredient.name,
                                category: updatedIngredient.category,
                                quantityUnits: updatedIngredient.quantityUnits,
                                quantity: updatedIngredient.quantity!,
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

            let shopingList: IShoppingIngredient[] = [];

            for (let i = 0; i < user.inventory.length; i++) {
                if (user.shoppingList[i].id === Number.parseInt(req.params.foodID)) {
                    isFound = true;
                } else {
                    shopingList.push(user.shoppingList[i]);
                }
            }

            if (!isFound) {
                return this.sendError(404, res, "Ingredient doesn't exist in shopping list.");
            }

            user.shoppingList = shopingList;

            let updatedUser = await this.requestUpdate(req.serverUser.username, user, res)
            return this.sendSuccess(200, res, updatedUser.shoppingList);
        } catch (e) {
            return e;
        }
    }
}
