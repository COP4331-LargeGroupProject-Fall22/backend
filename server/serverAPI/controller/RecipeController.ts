import { Request, Response } from "express";
import { ResponseCodes } from "../../utils/ResponseCodes";

import IRecipeAPI from "../../recipeAPI/IRecipeAPI";

import BaseController from "./BaseController/BaseController";

/**
 * This class creates several properties responsible for authentication actions 
 * provided to the user.
 */
export default class RecipeController extends BaseController {
    private recipeAPI: IRecipeAPI;

    constructor(recipeAPI: IRecipeAPI) {
        super();
        this.recipeAPI = recipeAPI;
    }

    /**
     * Lets client to search recipes using specified parameters provided in the URL.
     * Upon successful operation, this handler will return recipe items. 
     * 
     * @param req Request parameter that holds information about request
     * @param res Response parameter that holds information about response
     */
    getAll = async (req: Request, res: Response) => {
        let parameters = new Map<string, any>();

        if (req.query?.recipeName !== undefined) {
            parameters.set("recipeName", req.query.recipeName);
        }

        if (req.query?.page !== undefined) {
            parameters.set("page", req.query.page);
        }

        if (req.query?.resultsPerPage !== undefined) {
            parameters.set("resultsPerPage", req.query.resultsPerPage);
        }

        if (req.query?.intolerence !== undefined) {
            parameters.set("intolerance", req.query.intolerance);
        }

        if (req.query?.hasIngredients !== undefined) {
            parameters.set("hasIngredients", req.query.hasIngredients);
        }

        if (req.query?.cuisines !== undefined) {
            parameters.set("cuisines", req.query.cuisines);
        }

        if (req.query?.diets !== undefined) {
            parameters.set("diets", req.query.diets);
        }

        if (req.query?.mealTypes !== undefined) {
            parameters.set("mealTypes", req.query.mealTypes);
        }

        return this.recipeAPI.GetAll(parameters).then(recipes => this.send(ResponseCodes.OK, res, recipes), 
        (error) => this.send(ResponseCodes.BAD_REQUEST, res, this.getException(error)));
    }

    /**
     * Gets information about specific recipe using specified parameters provided in the URL.
     * 
     * @param req Request parameter that holds information about request
     * @param res Response parameter that holds information about response
     */
    get = async (req: Request, res: Response) => {
        let parameters = new Map<string, any>([
            ["id", req.params.recipeID]
        ]);

        return this.recipeAPI.Get(parameters).then(recipe => {
            if (recipe === null) {
                return this.send(ResponseCodes.NOT_FOUND, res,  "Recipe could not be found.");
            }

            return this.send(ResponseCodes.OK, res, recipe);
        }, (error) => this.send(ResponseCodes.BAD_REQUEST, res, this.getException(error)));
    }
}
