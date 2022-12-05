import { Request, Response } from "express";
import { ResponseCodes } from "../../utils/ResponseCodes";

import IRecipeAPI from "../../recipeAPI/IRecipeAPI";

import BaseController from "./BaseController/BaseController";
import IBaseRecipe from "../model/internal/recipe/IBaseRecipe";
import IBaseIngredient from "../model/internal/ingredient/IBaseIngredient";
import PaginatedResponse from "../model/internal/paginatedResponse/PaginatedResponse";
import BaseRecipeController from "./BaseController/BaseRecipeController";

/**
 * This class creates several properties responsible for authentication actions 
 * provided to the user.
 */
export default class RecipeController extends BaseRecipeController {
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

        let sortByMealTypes = req.query.sortByMealTypes === 'true';
        let sortByDiets = req.query.sortByDiets === 'true';
        let sortByCuisines = req.query.sortByCuisines === 'true';
        let sortByLexicographicalOrder = req.query.sortByLexicographicalOrder === 'true';

        let truthyCount = Number(sortByMealTypes) + Number(sortByDiets) + Number(sortByLexicographicalOrder) + Number(sortByCuisines);

        if (truthyCount > 1) {
            return this.send(ResponseCodes.BAD_REQUEST, res, "Multiple sorting algorithms are not allowed.");
        }

        let isReverse = req.query.isReverse === 'true' ? true : false;

        let ppaginatedRecipes: PaginatedResponse<IBaseRecipe<IBaseIngredient>>;
        try {
            let response = await this.recipeAPI.GetAll(parameters);

            if (response === null) {
                return this.send(ResponseCodes.OK, res, null);
            }

            ppaginatedRecipes = response;
        } catch (error) {
            return this.send(ResponseCodes.BAD_REQUEST, res, this.getException(error));
        }

        let responseData: [string, IBaseRecipe<IBaseIngredient>[]][] = this.convertResponse(ppaginatedRecipes.results);

        if (sortByCuisines) {
            responseData = this.sortByCuisines(ppaginatedRecipes, isReverse);
        }

        if (sortByDiets) {
            responseData = this.sortByDiets(ppaginatedRecipes, isReverse);
        }

        if (sortByMealTypes) {
            responseData = this.sortByMealTypes(ppaginatedRecipes, isReverse);
        }

        if (sortByLexicographicalOrder) {
            responseData = this.sortByLexicographicalOrder(ppaginatedRecipes, isReverse);
        }

        return this.send(ResponseCodes.OK, res, this.convertToPaginatedResponse(ppaginatedRecipes, responseData));
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
                return this.send(ResponseCodes.NOT_FOUND, res, "Recipe could not be found.");
            }

            return this.send(ResponseCodes.OK, res, recipe);
        }, (error) => this.send(ResponseCodes.BAD_REQUEST, res, this.getException(error)));
    }
}
