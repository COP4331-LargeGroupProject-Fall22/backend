import { Request, Response } from "express";
import IDatabase from "../../database/IDatabase";
import { ResponseCodes } from "../../utils/ResponseCodes";
import IBaseIngredient from "../model/ingredient/IBaseIngredient";
import BaseIngredientSchema from "../model/ingredient/requestSchema/BaseIngredientSchema";
import IUser from "../model/user/IUser";
import BaseIngredientController from "./BaseController/BaseIngredientController";

/**
 * This class creates several properties responsible for inventory actions 
 * provided to the user.
 */
export default class AllergenController extends BaseIngredientController {

    constructor(database: IDatabase<IUser>) {
        super(database);
    }

    private async parseAddRequest(req: Request, res: Response)
        : Promise<BaseIngredientSchema> {
        let jsonPayload = req.body;

        let ingredientSchema = new BaseIngredientSchema(
            Number.parseInt(jsonPayload.id),
            jsonPayload.name,
            jsonPayload.category,
        );

        try {
            ingredientSchema = await this.verifySchema(ingredientSchema, res);
        } catch (response) {
            return Promise.reject(response);
        }

        return ingredientSchema;
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

        try {
            let user = await this.requestGet(parameters, res)

            let responseData: any = user.allergens;

            if (req.query.sortByCategory === 'true') {
                responseData = this.sortByCategory(user.allergens, isReverse);    
            }

            if (req.query.sortByLexicographicalOrder === 'true') {
                responseData = this.sortByLexicographicalOrder(user.allergens, isReverse);    
            }

            return this.send(ResponseCodes.OK, res, responseData);
        } catch (e) {
            return e;
        }
    }

    /**
     * Adds ingredient to user's allergens.
     * 
     * @param req Request parameter that holds information about request.
     * @param res Response parameter that holds information about response.
     */
    add = async (req: Request, res: Response) => {
        let parameters = new Map<string, any>([["username", req.serverUser.username]]);

        try {
            let user = await this.requestGet(parameters, res);

            let ingredientSchema = await this.parseAddRequest(req, res);

            let duplicateingredient = user.allergens.find((ingredientItem: IBaseIngredient) => ingredientItem.id === ingredientSchema.id);

            if (duplicateingredient !== undefined) {
                return this.send(ResponseCodes.BAD_REQUEST, res, "Ingredient already exists in allergens.");
            }

            user.allergens.push(ingredientSchema);

            let updatedUser = await this.requestUpdate(req.serverUser.username, user, res);
            return this.send(ResponseCodes.CREATED, res, updatedUser.allergens);
        } catch (response) {
            return response;
        }
    }

    /**
     * Gets complete informations of the ingredient item from user's allergens.
     * 
     * @param req Request parameter that holds information about request
     * @param res Response parameter that holds information about response
     */
    get = async (req: Request, res: Response) => {
        let parameters = new Map<string, any>([["username", req.serverUser.username]]);

        try {
            let user = await this.requestGet(parameters, res)
            let ingredient = user.allergens
                .find((ingredientItem: IBaseIngredient) => ingredientItem.id === Number.parseInt(req.params.ingredientID));

            if (ingredient === undefined) {
                return this.send(ResponseCodes.NOT_FOUND, res, "Ingredient doesn't exist in allergens.");
            }

            return this.send(ResponseCodes.OK, res, ingredient);
        } catch (e) {
            return e;
        }
    }

    /**
     * Deletes ingredient item from item from user's allergens.
     * 
     * @param req Request parameter that holds information about request.
     * @param res Response parameter that holds information about response.
     */
    delete = async (req: Request, res: Response) => {
        let parameters = new Map<string, any>([["username", req.serverUser.username]]);

        try {
            let user = await this.requestGet(parameters, res)
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
                return this.send(ResponseCodes.NOT_FOUND, res, "Ingredient doesn't exist in allergens.");
            }

            user.allergens = newAllergens;

            let updatedUser = await this.requestUpdate(req.serverUser.username, user, res)
            return this.send(ResponseCodes.OK, res, updatedUser.allergens);
        } catch (e) {
            return e;
        }
    }
}
