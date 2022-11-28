import { Request, Response } from "express";
import { ResponseCodes } from "../../utils/ResponseCodes";

import IDatabase from "../../database/IDatabase";
import IRecipeAPI from "../../recipeAPI/IRecipeAPI";
import IBaseRecipe from "../model/internal/recipe/IBaseRecipe";
import IRecipe from "../model/internal/recipe/IRecipe";
import IUser from "../model/internal/user/IUser";

import UserBaseRecipe from "../model/internal/recipe/UserBaseRecipe";
import UserRecipe from "../model/internal/recipe/UserRecipe";

import BaseUserController from "./BaseController/BaseUserController";
import PaginatedResponse from "../model/internal/paginatedResponse/PaginatedResponse";

/**
 * This class creates several properties responsible for authentication actions 
 * provided to the user.
 */
export default class RecipeController extends BaseUserController {
    private recipeAPI: IRecipeAPI;

    constructor(database: IDatabase<IUser>, recipeAPI: IRecipeAPI) {
        super(database);

        this.recipeAPI = recipeAPI;
    }

    protected async convertToUserRecipe(recipe: IRecipe, req: Request, res: Response): Promise<UserRecipe> {
        let user: IUser;

        try {
            user = await this.requestGet(new Map([["username", req.serverUser.username]]), res);
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

    protected async convertToUserBaseRecipe(response: PaginatedResponse<IBaseRecipe>, req: Request, res: Response): Promise<UserBaseRecipe[]> {
        let user: IUser;

        try {
            user = await this.requestGet(new Map([["username", req.serverUser.username]]), res);
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

        return userRecipes;
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

        return this.recipeAPI.GetAll(parameters).then(async recipes => {
            if (recipes === null) {
                return this.send(ResponseCodes.OK, res, []);
            }

            return this.send(ResponseCodes.OK, res, await this.convertToUserBaseRecipe(recipes, req, res));
        }, (error) => this.send(ResponseCodes.BAD_REQUEST, res, this.getException(error)));
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
