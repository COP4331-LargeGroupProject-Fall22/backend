import { ObjectID } from "bson";
import { Request, Response } from "express";
import IDatabase from "../../database/IDatabase";
import IIngredientAPI from "../../ingredientAPI/IIngredientAPI";
import { ResponseCodes } from "../../utils/ResponseCodes";
import IShoppingIngredient from "../model/ingredient/IShoppingIngredient";
import ShoppingIngredientSchema from "../model/ingredient/requestSchema/ShoppingIngredientSchema";

import UnitSchema from "../model/unit/UnitSchema";
import IUser from "../model/user/IUser";
import BaseUserController from "./BaseUserController";

/**
 * This class creates several properties responsible for shopping list actions 
 * provided to the user.
 */
export default class ShoppingListController extends BaseUserController {
    private foodAPI: IIngredientAPI;

    constructor(database: IDatabase<IUser>, foodAPI: IIngredientAPI) {
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
        } catch (response) {
            return Promise.reject(response);
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
            } catch (response) {
                return Promise.reject(response);
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
            return this.send(ResponseCodes.OK, res, user.shoppingList);
        } catch (response) {
            return response;
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

            let listAlreadyHasItem: boolean = false;

            for (let i = 0; i < user.shoppingList.length; i++) {
                let existingItem = user.shoppingList[i];

                if (existingItem.id === ingredientSchema.id &&
                    existingItem.recipeID === ingredientSchema.recipeID) {
                    listAlreadyHasItem = true;

                    if (existingItem.recipeID !== null) {
                        return this.send(ResponseCodes.BAD_REQUEST, res, "Use update endpoint to change the amount of ingredient in the shopping list.");
                    }

                    let amount = ingredientSchema.quantity;

                    if (existingItem.quantity.unit !== ingredientSchema.quantity.unit) {
                        let convertedUnit =
                            await this.foodAPI.ConvertUnits(
                                ingredientSchema.quantity,
                                existingItem.quantity.unit,
                                existingItem.name
                            );

                        if (convertedUnit === null) {
                            return this.send(ResponseCodes.BAD_REQUEST, res, "Amount units cannot be converted.");
                        }

                        amount = convertedUnit;
                    }

                    user.shoppingList[i].quantity.value += amount.value;

                    break;
                }
            }

            if (!listAlreadyHasItem) {
                user.shoppingList.push(ingredientSchema);
            }

            let updatedUser = await this.requestUpdate(req.serverUser.username, user, res);
            return this.send(ResponseCodes.CREATED, res, updatedUser.shoppingList);
        } catch (response) {
            return response;
        }
    }

    /**
     * Gets complete informations of the food item from user's shopping list.
     * 
     * @param req Request parameter that holds information about request
     * @param res Response parameter that holds information about response
     */
    get = async (req: Request, res: Response) => {
        let parameters = new Map<string, any>([["username", req.serverUser.username]]);

        try {
            let user = await this.requestGet(parameters, res)
            let ingredient = user.shoppingList
                .find((foodItem: IShoppingIngredient) => foodItem.itemID === req.params.itemID);

            if (ingredient === undefined) {
                return this.send(ResponseCodes.NOT_FOUND, res, "Ingredient doesn't exist in shopping list.");
            }

            return this.send(ResponseCodes.OK, res, ingredient);
        } catch (response) {
            return response;
        }
    }

    /**
     * Updates information of the food item from user's shopping list.
     * 
     * @param req Request parameter that holds information about request
     * @param res Response parameter that holds information about response
     */
    update = async (req: Request, res: Response) => {
        let parameters = new Map<string, any>([["username", req.serverUser.username]]);

        try {
            let user = await this.requestGet(parameters, res);

            let listHasItem: boolean = false;

            for (let i = 0; i < user.shoppingList.length; i++) {
                let existingIngredient = user.shoppingList[i];

                if (existingIngredient.itemID === req.params.itemID) {
                    listHasItem = true;

                    let ingredient = await this.parseUpdateRequest(req, res, existingIngredient);
                    user.shoppingList[i] = ingredient;
                }
            }

            if (!listHasItem) {
                return this.send(ResponseCodes.NOT_FOUND, res, "Use Add endpoint to add ingredient to the shopping list.");
            }

            let updatedUser = await this.requestUpdate(req.serverUser.username, user, res);
            return this.send(ResponseCodes.OK, res, updatedUser.shoppingList);
        } catch (response) {
            return response;
        }
    }

    /**
     * Deletes food item from item from user's shopping list.
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

            for (let i = 0; i < user.shoppingList.length; i++) {
                if (user.shoppingList[i].itemID === req.params.itemID) {
                    isFound = true;
                } else {
                    shopingList.push(user.shoppingList[i]);
                }
            }

            if (!isFound) {
                return this.send(ResponseCodes.NOT_FOUND, res, "Ingredient doesn't exist in shopping list.");
            }

            user.shoppingList = shopingList;

            let updatedUser = await this.requestUpdate(req.serverUser.username, user, res)
            return this.send(ResponseCodes.OK, res, updatedUser.shoppingList);
        } catch (response) {
            return response;
        }
    }
}
