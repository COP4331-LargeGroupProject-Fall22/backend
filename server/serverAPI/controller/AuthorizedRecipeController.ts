import { Request, response, Response } from "express";
import { ResponseCodes } from "../../utils/ResponseCodes";

import IDatabase from "../../database/IDatabase";
import IRecipeAPI from "../../recipeAPI/IRecipeAPI";
import IBaseRecipe from "../model/internal/recipe/IBaseRecipe";
import IRecipe from "../model/internal/recipe/IRecipe";
import IUser from "../model/internal/user/IUser";
import IBaseIngredient from "../model/internal/ingredient/IBaseIngredient";

import UserBaseRecipe from "../model/internal/recipe/UserBaseRecipe";
import UserRecipe from "../model/internal/recipe/UserRecipe";

import PaginatedResponse from "../model/internal/paginatedResponse/PaginatedResponse";
import BaseRecipeController from "./BaseController/BaseRecipeController";
import BaseUserController from "./BaseController/BaseUserController";

/**
 * This class creates several properties responsible for authentication actions 
 * provided to the user.
 */
export default class RecipeController extends BaseRecipeController {
    private recipeAPI: IRecipeAPI;
    private baseUserController: BaseUserController;

    constructor(baseUserController: BaseUserController, recipeAPI: IRecipeAPI) {
        super();
        
        this.baseUserController = baseUserController;
        this.recipeAPI = recipeAPI;
    }

    protected async convertToUserRecipe(recipe: IRecipe, req: Request, res: Response): Promise<UserRecipe> {
        let user: IUser;

        try {
            user = await this.baseUserController.requestGet(new Map([["username", req.serverUser.username]]), res);
        } catch (response) {
            return Promise.reject(response);
        }

        let recipeSet: Set<number> = new Set();
        user.favoriteRecipes.forEach(recipe => recipeSet.add(recipe.id));

        let allergenSet: Set<number> = new Set();
        user.allergens.forEach(allergen => allergenSet.add(allergen.id));

        let userRecipe: UserRecipe;

        let isFavorite = recipeSet.has(recipe.id);

        let allergen = recipe.instruction.ingredients.find(ingredient => allergenSet.has(ingredient.id))

        let hasAllergens = allergen !== undefined;

        userRecipe = new UserRecipe(recipe, isFavorite, hasAllergens);

        return userRecipe;
    }

    protected async convertToUserBaseRecipe(response: PaginatedResponse<IBaseRecipe<IBaseIngredient>>, req: Request, res: Response)
        : Promise<PaginatedResponse<UserBaseRecipe>> {
        let user: IUser;

        try {
            user = await this.baseUserController.requestGet(new Map([["username", req.serverUser.username]]), res);
        } catch (response) {
            return Promise.reject(response);
        }

        let recipeSet: Set<number> = new Set();
        user.favoriteRecipes.forEach(recipe => recipeSet.add(recipe.id));

        let allergenSet: Set<number> = new Set();
        user.allergens.forEach(allergen => allergenSet.add(allergen.id));

        let userRecipes: UserBaseRecipe[] = [];

        response.results.forEach(recipe => {
            let isFavorite = recipeSet.has(recipe.id);

            let allergen = recipe.ingredients.find(ingredient => allergenSet.has(ingredient.id))

            let hasAllergens = allergen !== undefined;

            userRecipes.push(new UserBaseRecipe(recipe, isFavorite, hasAllergens));
        });

        return new PaginatedResponse(response.numOfPages, response.numOfResults, response.currentPage, userRecipes);
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
            parameters.set("diets", req.query.cusines);
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

        let userBaseRecpes: PaginatedResponse<UserBaseRecipe>;
        try {
            let response = await this.recipeAPI.GetAll(parameters);

            if (response === null) {
                return this.send(ResponseCodes.OK, res, null);
            }

            userBaseRecpes = await this.convertToUserBaseRecipe(response, req, res);
        } catch (error) {
            return this.send(ResponseCodes.BAD_REQUEST, res, this.getException(error));
        }

        let responseData: [string, UserBaseRecipe[]][] = this.convertResponse(userBaseRecpes.results);

        if (sortByCuisines) {
            responseData = this.sortByCuisines(userBaseRecpes, isReverse);
        }

        if (sortByDiets) {
            responseData = this.sortByDiets(userBaseRecpes, isReverse);
        }

        if (sortByMealTypes) {
            responseData = this.sortByMealTypes(userBaseRecpes, isReverse);
        }

        if (sortByLexicographicalOrder) {
            responseData = this.sortByLexicographicalOrder(userBaseRecpes, isReverse);
        }

        return this.send(ResponseCodes.OK, res, this.convertToPaginatedResponse(userBaseRecpes, responseData));
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

        return this.recipeAPI.Get(parameters).then(async recipe => {
            if (recipe === null) {
                return this.send(ResponseCodes.NOT_FOUND, res, "Recipe could not be found.");
            }

            return this.send(ResponseCodes.OK, res, await this.convertToUserRecipe(recipe, req, res));
        }, (error) => this.send(ResponseCodes.BAD_REQUEST, res, this.getException(error)));
    }
}
