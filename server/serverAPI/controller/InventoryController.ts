import { Request, Response } from "express";
import { ResponseCodes } from "../../utils/ResponseCodes";

import IDatabase from "../../database/IDatabase";
import IInventoryIngredient from "../model/internal/ingredient/IInventoryIngredient";
import IUser from "../model/internal/user/IUser";

import ImageSchema from "../model/internal/image/ImageSchema";
import AddRequestSchema from "../model/external/requests/inventory/AddRequest";
import UpdateRequestSchema from "../model/external/requests/inventory/UpdateRequest";

import BaseIngredientController from "./BaseController/BaseIngredientController";

/**
 * This class creates several properties responsible for inventory actions 
 * provided to the user.
 */
export default class InventoryController extends BaseIngredientController {

    constructor(database: IDatabase<IUser>) {
        super(database);
    }

    private async parseUpdateRequest(req: Request, res: Response): Promise<UpdateRequestSchema> {
        let expirationDate: null | number = req.body?.expirationDate !== undefined ?
            Number(req.body?.expirationDate) : null;

        console.log(req.body);
        let request = new UpdateRequestSchema(expirationDate);

        console.log(request);
        return this.verifySchema(request, res);
    }

    private async parseAddRequest(req: Request, res: Response): Promise<AddRequestSchema> {
        let expirationDate: null | number = req.body?.expirationDate !== undefined ?
            Number(req.body?.expirationDate) : null;

        let request = new AddRequestSchema(
            Number(req.body?.id),
            req.body?.name,
            req.body?.category,
            new ImageSchema(req.body?.image?.srcUrl),
            expirationDate
        );

        return this.verifySchema(request, res);
    }

    protected sortByExpirationDate(collection: IInventoryIngredient[], isReverse: boolean): [string, IInventoryIngredient[]][] {
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

        return Array.from([["Items with expiration date", itemsWithExpirationDate], ["Items without expiration date", itemsWithoutExpirationDate]]);
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

        let responseData: any = this.convertResponse(user.inventory);

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

        let parsedRequest: AddRequestSchema;
        try {
            parsedRequest = await this.parseAddRequest(req, res);
        } catch (response) {
            return response;
        }

        let duplicateingredient = user.inventory.find((ingredientItem: IInventoryIngredient) => ingredientItem.id === parsedRequest.id);

        if (duplicateingredient !== undefined) {
            return this.send(ResponseCodes.BAD_REQUEST, res, "Ingredient already exists in inventory.");
        }

        user.inventory.push(parsedRequest);

        let updatedUser = await this.requestUpdate(req.serverUser.username, user, res);
        return this.send(ResponseCodes.CREATED, res, this.convertResponse(updatedUser.inventory));
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
            .find((ingredientItem: IInventoryIngredient) => ingredientItem.id === Number(req.params.ingredientID));

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

        let parsedRequest: UpdateRequestSchema;
        let user: IUser;

        try {
            parsedRequest = await this.parseUpdateRequest(req, res);
            user = await this.requestGet(parameters, res);
        } catch (response) {
            return response;
        }

        let isFound: boolean = false;

        for (let i = 0; i < user.inventory.length; i++) {
            if (user.inventory[i].id === Number(req.params.ingredientID)) {
                isFound = true;
                user.inventory[i].expirationDate = parsedRequest.expirationDate;
            }
        }

        if (!isFound) {
            return this.send(ResponseCodes.NOT_FOUND, res, "Ingredient could not be found.");
        }

        let updatedUser = await this.requestUpdate(req.serverUser.username, user, res);

        return this.send(ResponseCodes.OK, res, this.convertResponse(updatedUser.inventory));
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
            if (user.inventory[i].id === Number(req.params.ingredientID)) {
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

        return this.send(ResponseCodes.OK, res, this.convertResponse(updatedUser.inventory));
    }
}
