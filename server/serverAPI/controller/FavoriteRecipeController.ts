import { Request, Response } from "express";
import { ResponseCodes } from "../../utils/ResponseCodes";

import IDatabase from "../../database/IDatabase";
import IRecipeAPI from "../../recipeAPI/IRecipeAPI";
import IBaseRecipe from "../model/internal/recipe/IBaseRecipe";
import IUser from "../model/internal/user/IUser";
import IBaseIngredient from "../model/internal/ingredient/IBaseIngredient";

import ImageSchema from "../model/internal/image/ImageSchema";
import AddRequestSchema from "../model/external/requests/favoriteRecipeList/AddRequest";

import BaseUserController from "./BaseController/BaseUserController";

/**
 * This class creates several properties responsible for favorite recipes actions 
 * provided to the user.
 */
export default class FavoriteRecipeController extends BaseUserController {
    private recipeAPI: IRecipeAPI;

    constructor(database: IDatabase<IUser>, recipeAPI: IRecipeAPI) {
        super(database);

        this.recipeAPI = recipeAPI;
    }

    private parseAddRequest(req: Request, res: Response): Promise<AddRequestSchema> {
        let request = new AddRequestSchema(
            Number(req.body?.id),
            req.body?.name,
            req.body?.cuisines,
            req.body?.diets,
            req.body?.mealTypes,
            new ImageSchema(req.body?.image?.srcUrl),
            req.body?.ingredients
        );

        return this.verifySchema(request, res);
    }

    /**
     * Returns all user's favorite recipes.
     * 
     * @param req Request parameter that holds information about request.
     * @param res Response parameter that holds information about response.
     */
    getAll = async (req: Request, res: Response) => {
        let parameters = new Map<string, any>([["username", req.serverUser.username]]);

        let user: IUser;

        try {
            user = await this.requestGet(parameters, res)
        } catch (response) {
            return response;
        }

        return this.send(ResponseCodes.OK, res, user.favoriteRecipes);
    }

    /**
     * Adds recipe to user's favorite recipes.
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

        let duplicateRecipe = user.favoriteRecipes.find((recipeItem: IBaseRecipe<IBaseIngredient>) => recipeItem.id === parsedRequest.id);

        if (duplicateRecipe !== undefined) {
            return this.send(ResponseCodes.BAD_REQUEST, res, "Recipe already exists in favorite recipes.");
        }

        user.favoriteRecipes.push(parsedRequest);

        let updatedUser = await this.requestUpdate(req.serverUser.username, user, res);

        return this.send(ResponseCodes.CREATED, res, updatedUser.favoriteRecipes);
    }

    /**
     * Gets complete informations of the recipe item from user's favorite recipes.
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

        let recipe = user.favoriteRecipes
            .find((ingredientItem: IBaseRecipe<IBaseIngredient>) => ingredientItem.id === Number(req.params.recipeID));

        if (recipe === undefined) {
            return this.send(ResponseCodes.NOT_FOUND, res, "Recipe doesn't exist in favorite recipes.");
        }

        return this.recipeAPI.Get(new Map([["id", recipe.id]]))
            .then((recipe) => this.send(ResponseCodes.OK, res, recipe))
            .catch((error) => this.send(ResponseCodes.BAD_REQUEST, res, error));
    }

    /**
     * Deletes recipe item from user's favorite recipes.
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

        let newFavoriteRecipes: IBaseRecipe<IBaseIngredient>[] = [];

        for (let i = 0; i < user.favoriteRecipes.length; i++) {
            if (user.favoriteRecipes[i].id === Number(req.params.recipeID)) {
                isFound = true;
            } else {
                newFavoriteRecipes.push(user.favoriteRecipes[i])
            }
        }

        if (!isFound) {
            return this.send(ResponseCodes.NOT_FOUND, res, "Recipe doesn't exist in favorite recipes.");
        }

        user.favoriteRecipes = newFavoriteRecipes;

        let updatedUser = await this.requestUpdate(req.serverUser.username, user, res)
        return this.send(ResponseCodes.OK, res, updatedUser.favoriteRecipes);
    }
}
