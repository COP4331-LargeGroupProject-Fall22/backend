import { Request, Response } from "express";
import { ResponseCodes } from "../../utils/ResponseCodes";

import IUser from "../model/internal/user/IUser";
import IDatabase from "../../database/IDatabase";
import IBaseIngredient from "../model/internal/ingredient/IBaseIngredient";

import ImageSchema from "../model/internal/image/ImageSchema";
import AddRequestSchema from "../model/external/requests/allergen/AddRequest";

import BaseIngredientController from "./BaseController/BaseIngredientController";

/**
 * This class creates several properties responsible for allergens actions 
 * provided to the user.
 */
export default class AllergenController extends BaseIngredientController {
    constructor(database: IDatabase<IUser>) {
        super(database);
    }

    protected parseAddRequest(req: Request, res: Response): Promise<AddRequestSchema> {
        let request = new AddRequestSchema(
            Number.parseInt(req.body?.id),
            req.body?.name,
            req.body?.category,
            new ImageSchema(req.body?.imageUrl)
        );

        return this.verifySchema(request, res);;
    }

    /**
     * Returns all user's allergens.
     * 
     * @param req Request parameter that holds information about request.
     * @param res Response parameter that holds information about response.
     */
    getAll = async (req: Request, res: Response) => {
        let parameters = new Map<string, any>([["username", req.serverUser.username]]);

        let isReverse = req.query.isReverse === 'true' ? true : false;

        let user: IUser;

        try {
            user = await this.requestGet(parameters, res)
        } catch (response) {
            return response;
        }

        let responseData: any = user.allergens;

        if (req.query.sortByCategory === 'true') {
            responseData = this.sortByCategory(user.allergens, isReverse);
        }

        if (req.query.sortByLexicographicalOrder === 'true') {
            responseData = this.sortByLexicographicalOrder(user.allergens, isReverse);
        }

        return this.send(ResponseCodes.OK, res, responseData);
    }

    /**
     * Adds ingredient to user's allergens.
     * 
     * @param req Request parameter that holds information about request.
     * @param res Response parameter that holds information about response.
     */
    add = async (req: Request, res: Response) => {
        let parameters = new Map<string, any>([["username", req.serverUser.username]]);

        let parsedRequest: AddRequestSchema;
        let user: IUser;

        try {
            parsedRequest = await this.parseAddRequest(req, res);
            user = await this.requestGet(parameters, res);
        } catch (response) {
            return response;
        }


        let duplicateingredient = user.allergens.find((ingredientItem: IBaseIngredient) => ingredientItem.id === parsedRequest.id);

        if (duplicateingredient !== undefined) {
            return this.send(ResponseCodes.BAD_REQUEST, res, "Ingredient already exists in allergens.");
        }

        user.allergens.push(parsedRequest);

        let updatedUser = await this.requestUpdate(req.serverUser.username, user, res);
        return this.send(ResponseCodes.CREATED, res, updatedUser.allergens);
    }

    /**
     * Gets complete informations of the ingredient item from user's allergens.
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

        let ingredient = user.allergens
            .find((ingredientItem: IBaseIngredient) => ingredientItem.id === Number.parseInt(req.params.ingredientID));

        if (ingredient === undefined) {
            return this.send(ResponseCodes.NOT_FOUND, res, "Ingredient could not be found in allergen list.");
        }

        return this.send(ResponseCodes.OK, res, ingredient);
    }

    /**
     * Deletes ingredient item from item from user's allergens.
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

        let newAllergens: IBaseIngredient[] = [];

        for (let i = 0; i < user.allergens.length; i++) {
            if (user.allergens[i].id === Number.parseInt(req.params.ingredientID)) {
                isFound = true;
            } else {
                newAllergens.push(user.allergens[i]);
            }
        }

        if (!isFound) {
            return this.send(ResponseCodes.NOT_FOUND, res, "Ingredient could not be found in allergen list.");
        }

        user.allergens = newAllergens;

        let updatedUser = await this.requestUpdate(req.serverUser.username, user, res)
        return this.send(ResponseCodes.OK, res, updatedUser.allergens);
    }
}
