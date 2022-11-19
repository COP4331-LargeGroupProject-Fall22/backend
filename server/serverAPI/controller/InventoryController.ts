import { Request, Response } from "express";
import IDatabase from "../../database/IDatabase";
import { ResponseCodes } from "../../utils/ResponseCodes";
import IInventoryIngredient from "../model/ingredient/IInventoryIngredient";
import InventoryIngredientSchema from "../model/ingredient/requestSchema/InventoryIngredientSchema";
import IUser from "../model/user/IUser";
import BaseIngredientController from "./BaseController/BaseIngredientController";

/**
 * This class creates several properties responsible for inventory actions 
 * provided to the user.
 */
export default class InventoryController extends BaseIngredientController {

    constructor(database: IDatabase<IUser>) {
        super(database);
    }

    private async parseUpdateRequest(req: Request, existingIngredient: IInventoryIngredient)
        : Promise<IInventoryIngredient> {
        let ingredientSchema = new InventoryIngredientSchema(
            existingIngredient.id,
            existingIngredient.name,
            existingIngredient.category,
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
            jsonPayload?.expirationDate !== undefined ? Number.parseInt(jsonPayload.expirationDate) : null
        );

        try {
            ingredientSchema = await this.verifySchema(ingredientSchema, res);
        } catch (response) {
            return Promise.reject(response);
        }

        return ingredientSchema;
    }

    protected sortByExpirationDate(collection: IInventoryIngredient[], isReverse: boolean): any {
        let itemsWithExpirationDate: IInventoryIngredient[] = [];
        let itemsWithoutExpirationDate: IInventoryIngredient[] = [];

        collection.forEach(item => {
            if (item.expirationDate) {
                itemsWithExpirationDate.push(item);
            } else {
                itemsWithoutExpirationDate.push(item);
            }
        });

        itemsWithoutExpirationDate.sort((a, b) => a.name.localeCompare(b.name));

        // Sorts from earliest to latest expiration date
        itemsWithExpirationDate.sort((a, b) => b.expirationDate! - a.expirationDate!);

        if (isReverse) {
            itemsWithExpirationDate.reverse();
        }

        return {
            hasExpirationDate: itemsWithExpirationDate,
            noExpirationDate: itemsWithoutExpirationDate
        }
    }

    /**
     * Returns all ingredient in user inventory.
     * 
     * @param req Request parameter that holds information about request.
     * @param res Response parameter that holds information about response.
     */
    getAll = async (req: Request, res: Response) => {
        let parameters = new Map<string, any>([["username", req.serverUser.username]]);

        let sortByExpirationDate = req.query.sortByExpirationDate === 'true';
        let sortByCategory = req.query.sortByCategory === 'true';
        let sortByLexicographicalOrder = req.query.sortByLexicographicalOrder === 'true';

        let truthyCount = Number(sortByExpirationDate) + Number(sortByCategory) + Number(sortByLexicographicalOrder);

        if (truthyCount > 1) {
            return this.send(ResponseCodes.BAD_REQUEST, res, "Multiple sorting algorithms are not allowed.");
        }

        let isReverse = req.query.isReverse === 'true' ? true : false;

        let user: IUser;

        try {
            user = await this.requestGet(parameters, res)
        } catch (response) {
            return response;
        }

        let responseData: any = user.inventory;

        if (sortByExpirationDate) {
            responseData = this.sortByExpirationDate(user.inventory, isReverse);
        }

        if (sortByCategory) {
            responseData = this.sortByCategory(user.inventory, isReverse);
        }

        if (sortByLexicographicalOrder) {
            responseData = this.sortByLexicographicalOrder(user.inventory, isReverse);
        }

        return this.send(ResponseCodes.OK, res, responseData);
    }

    /**
     * Adds ingredient to user's inventory.
     * 
     * @param req Request parameter that holds information about request.
     * @param res Response parameter that holds information about response.
     */
    add = async (req: Request, res: Response) => {
        let parameters = new Map<string, any>([["username", req.serverUser.username]]);

        let user: IUser;

        try {
            user = await this.requestGet(parameters, res);
        } catch (response) {
            return response;
        }

        let ingredientSchema = await this.parseAddRequest(req, res);

        let duplicateingredient = user.inventory.find((ingredientItem: IInventoryIngredient) => ingredientItem.id === ingredientSchema.id);

        if (duplicateingredient !== undefined) {
            return this.send(ResponseCodes.BAD_REQUEST, res, "Ingredient already exists in inventory.");
        }

        user.inventory.push(ingredientSchema);

        let updatedUser = await this.requestUpdate(req.serverUser.username, user, res);
        return this.send(ResponseCodes.CREATED, res, updatedUser.inventory);
    }

    /**
     * Gets complete informations of the ingredient item from user's inventory.
     * 
     * @param req Request parameter that holds information about request
     * @param res Response parameter that holds information about response
     */
    get = async (req: Request, res: Response) => {
        let parameters = new Map<string, any>([["username", req.serverUser.username]]);

        let user: IUser;

        try {
            user = await this.requestGet(parameters, res)
        } catch (response) {
            return response;
        }

        let ingredient = user.inventory
            .find((ingredientItem: IInventoryIngredient) => ingredientItem.id === Number.parseInt(req.params.ingredientID));

        if (ingredient === undefined) {
            return this.send(ResponseCodes.NOT_FOUND, res, "Ingredient could not be found.");
        }

        return this.send(ResponseCodes.OK, res, ingredient);
    }

    /**
     * Updates information of the ingredient item from user's inventory.
     * 
     * @param req Request parameter that holds information about request
     * @param res Response parameter that holds information about response
     */
    update = async (req: Request, res: Response) => {
        let parameters = new Map<string, any>([["username", req.serverUser.username]]);

        let user: IUser;

        try {
            user = await this.requestGet(parameters, res);
        } catch (response) {
            return response;
        }

        let isFound: boolean = false;

        for (let i = 0; i < user.inventory.length; i++) {
            let existingIngredient = user.inventory[i];

            if (user.inventory[i].id === Number.parseInt(req.params.ingredientID)) {
                isFound = true;
                user.inventory[i] = await this.parseUpdateRequest(req, existingIngredient);
            }
        }

        if (!isFound) {
            return this.send(ResponseCodes.NOT_FOUND, res, "Ingredient could not be found.");
        }

        let updatedUser = await this.requestUpdate(req.serverUser.username, user, res);

        return this.send(ResponseCodes.OK, res, updatedUser.inventory);
    }

    /**
     * Deletes ingredient item from item from user's inventory.
     * 
     * @param req Request parameter that holds information about request.
     * @param res Response parameter that holds information about response.
     */
    delete = async (req: Request, res: Response) => {
        let parameters = new Map<string, any>([["username", req.serverUser.username]]);

        let user: IUser;

        try {
            user = await this.requestGet(parameters, res)
        } catch (response) {
            return response;
        }

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
            return this.send(ResponseCodes.NOT_FOUND, res, "Ingredient could not be found.");
        }

        user.inventory = newInventory;

        let updatedUser = await this.requestUpdate(req.serverUser.username, user, res);

        return this.send(ResponseCodes.OK, res, updatedUser.inventory);
    }
}
