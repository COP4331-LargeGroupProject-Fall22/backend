import { Request, Response } from "express";
import IDatabase from "../../database/IDatabase";
import IIngredientAPI from "../../ingredientAPI/IIngredientAPI";

import IInventoryIngredient from "../model/ingredient/IInventoryIngredient";
import InventoryIngredientSchema from "../model/ingredient/requestSchema/InventoryIngredientSchema";
import IUser from "../model/user/IUser";
import BaseUserController from "./BaseUserController";

/**
 * This class creates several properties responsible for inventory actions 
 * provided to the user.
 */
export default class InventoryController extends BaseUserController {
    private ingredientAPI: IIngredientAPI;

    constructor(database: IDatabase<IUser>, ingredientAPI: IIngredientAPI) {
        super(database);
        this.ingredientAPI = ingredientAPI;
    }

    private async parseUpdateRequest(req: Request, res: Response, existingIngredient: IInventoryIngredient)
        : Promise<IInventoryIngredient> {
        let ingredientSchema = new InventoryIngredientSchema(
            existingIngredient.id,
            existingIngredient.name,
            existingIngredient.category,
            existingIngredient.quantityUnits,
            existingIngredient.expirationDate
        );

        ingredientSchema.expirationDate = this.isStringUndefinedOrEmpty(req.body.expirationDate) ?
            existingIngredient.expirationDate : Number.parseFloat(req.body.expirationDate);

        return ingredientSchema;
    }

    private async parseAddRequest(req: Request, res: Response)
        : Promise<IInventoryIngredient> {
        let jsonPayload = req.body;
        let ingredientSchema = new InventoryIngredientSchema(
            Number.parseInt(jsonPayload.id),
            jsonPayload.name,
            jsonPayload.category,
            jsonPayload.quantityUnits,
            Number.parseInt(jsonPayload.expirationDate)
        );

        try {
            ingredientSchema = await this.verifySchema(ingredientSchema, res);
        } catch (e) {
            return Promise.reject(e);
        }

        return ingredientSchema;
    }

    /**
     * Returns all ingredient in user inventory.
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
     * Adds ingredient to user's inventory.
     * 
     * @param req Request parameter that holds information about request.
     * @param res Response parameter that holds information about response.
     */
    add = async (req: Request, res: Response) => {
        let parameters = new Map<string, any>([["username", req.serverUser.username]]);

        try {
            let user = await this.requestGet(parameters, res);

            let ingredientSchema = await this.parseAddRequest(req, res);

            let duplicateingredient = user.inventory.find((ingredientItem: IInventoryIngredient) => ingredientItem.id === ingredientSchema.id);

            if (duplicateingredient !== undefined) {
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
     * Gets complete informations of the ingredient item from user's inventory.
     * 
     * @param req Request parameter that holds information about request
     * @param res Response parameter that holds information about response
     */
    get = async (req: Request, res: Response) => {
        let parameters = new Map<string, any>([["username", req.serverUser.username]]);

        try {
            let user = await this.requestGet(parameters, res)
            let ingredient = user.inventory
                .find((ingredientItem: IInventoryIngredient) => ingredientItem.id === Number.parseInt(req.params.ingredientID));

            if (ingredient === undefined) {
                return this.sendError(404, res, "Ingredient doesn't exist in inventory.");
            }

            return this.sendSuccess(200, res, ingredient);
        } catch (e) {
            return e;
        }
    }

    /**
     * Updates information of the ingredient item from user's inventory.
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

                if (user.inventory[i].id === Number.parseInt(req.params.ingredientID)) {
                    isFound = true;
                    user.inventory[i] = await this.parseUpdateRequest(req, res, existingIngredient);
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
     * Deletes ingredient item from item from user's inventory.
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
                if (user.inventory[i].id === Number.parseInt(req.params.ingredientID)) {
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
