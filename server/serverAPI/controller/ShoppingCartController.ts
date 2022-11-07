import { ObjectID } from "bson";
import { Request, Response } from "express";
import IDatabase from "../../database/IDatabase";
import IFoodAPI from "../../foodAPI/IFoodAPI";
import IShoppingIngredient from "../model/food/IShoppingIngredient";
import ShoppingIngredientSchema from "../model/food/requestSchema/ShoppingIngredient";

import UnitSchema from "../model/unit/UnitSchema";
import IUser from "../model/user/IUser";
import BaseUserController from "./BaseUserController";

/**
 * This class creates several properties responsible for inventory actions 
 * provided to the user.
 */
export default class ShoppingCartController extends BaseUserController {
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
            jsonPayload.quantityUnits,
            jsonPayload.quantity,
            jsonPayload.recipeID === undefined ? null : jsonPayload.recipeID
        );

        ingredientSchema.itemID = new ObjectID().toHexString();

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
            existingIngredient.quantityUnits,
            existingIngredient.quantity,
            existingIngredient.recipeID
        );

        ingredientSchema.itemID = existingIngredient.itemID;

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
            return this.sendSuccess(200, res, user.shoppingCart);
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

            let exists: boolean = false;

            for (let i = 0; i < user.shoppingCart.length; i++) {
                let existingItem = user.shoppingCart[i];
                console.log(existingItem);

                if (existingItem.id === ingredientSchema.id &&
                    existingItem.recipeID === ingredientSchema.recipeID
                ) {
                    exists = true;

                    if (existingItem.recipeID !== null) {
                        return this.sendError(400, res, "Ingredient for this recipe already exists in shopping cart.");
                    }

                    let amount = ingredientSchema.quantity;

                    if (existingItem.quantity.unit !== ingredientSchema.quantity.unit) {
                        let convertedUnit = await this.foodAPI.ConvertUnits(ingredientSchema.quantity, existingItem.quantity.unit);
                        
                        if (convertedUnit === null) {
                            return this.sendError(400, res, "Amount units cannot be converted.");
                        }

                        amount = convertedUnit;
                    }

                    user.shoppingCart[i].quantity.value += amount.value;

                    break;
                }
            }

            if (!exists) {
                user.shoppingCart.push(ingredientSchema);
            }

            let updatedUser = await this.requestUpdate(req.serverUser.username, user, res);
            return this.sendSuccess(200, res, updatedUser.shoppingCart);
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
            let ingredient = user.shoppingCart
                .find((foodItem: IShoppingIngredient) => foodItem.itemID === req.params.itemID);

            if (ingredient === undefined) {
                return this.sendError(404, res, "Ingredient doesn't exist in shopping cart.");
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

            for (let i = 0; i < user.shoppingCart.length; i++) {
                let existingIngredient = user.shoppingCart[i];

                if (existingIngredient.itemID === req.params.itemID) {
                    isFound = true;

                    if (existingIngredient.recipeID !== null) {
                        return this.sendError(400, res, "Cannot modify ingredients provided by recipe.");
                    }

                    let ingredient = await this.parseUpdateRequest(req, res, existingIngredient);
                    user.shoppingCart[i] = ingredient;
                }
            }

            if (!isFound) {
                return this.sendError(404, res, "Ingredient could not be found.");
            }

            let updatedUser = await this.requestUpdate(req.serverUser.username, user, res);
            return this.sendSuccess(200, res, updatedUser.shoppingCart);
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

            for (let i = 0; i < user.shoppingCart.length; i++) {
                if (user.shoppingCart[i].itemID === req.params.itemID) {
                    isFound = true;
                } else {
                    shopingList.push(user.shoppingCart[i]);
                }
            }

            if (!isFound) {
                return this.sendError(404, res, "Ingredient doesn't exist in shopping cart.");
            }

            user.shoppingCart = shopingList;

            let updatedUser = await this.requestUpdate(req.serverUser.username, user, res)
            return this.sendSuccess(200, res, updatedUser.shoppingCart);
        } catch (e) {
            return e;
        }
    }
}
