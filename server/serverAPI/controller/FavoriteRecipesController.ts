import { Request, Response } from "express";
import IDatabase from "../../database/IDatabase";
import IRecipeAPI from "../../recipeAPI/IRecipeAPI";
import { ResponseCodes } from "../../utils/ResponseCodes";
import ImageSchema from "../model/image/requestSchema/ImageSchema";
import IBaseRecipe from "../model/recipe/IBaseRecipe";
import BaseRecipeSchema from "../model/recipe/requestSchema/BaseRecipeSchema";
import IUser from "../model/user/IUser";
import BaseUserController from "./BaseController/BaseUserController";

/**
 * This class creates several properties responsible for inventory actions 
 * provided to the user.
 */
export default class FavoriteRecipesController extends BaseUserController {
    private recipeAPI: IRecipeAPI;

    constructor(database: IDatabase<IUser>, recipeAPI: IRecipeAPI) {
        super(database);

        this.recipeAPI = recipeAPI;
    }

    private async parseAddRequest(req: Request, res: Response)
        : Promise<IBaseRecipe> {
        let jsonPayload = req.body;

        let recipeSchema = new BaseRecipeSchema(
            Number.parseInt(jsonPayload.id),
            jsonPayload.name,
            new ImageSchema(jsonPayload.image.srcUrl),
        );

        try {
            recipeSchema = await this.verifySchema(recipeSchema, res);
        } catch (response) {
            return Promise.reject(response);
        }

        return recipeSchema;
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

        let recipeSchema = await this.parseAddRequest(req, res);

        let duplicateRecipe = user.favoriteRecipes.find((recipeItem: IBaseRecipe) => recipeItem.id === recipeSchema.id);

        if (duplicateRecipe !== undefined) {
            return this.send(ResponseCodes.BAD_REQUEST, res, "Recipe already exists in favorite recipes.");
        }

        user.favoriteRecipes.push(recipeSchema);

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
            .find((ingredientItem: IBaseRecipe) => ingredientItem.id === Number.parseInt(req.params.recipeID));

        if (recipe === undefined) {
            return this.send(ResponseCodes.NOT_FOUND, res, "Recipe doesn't exist in favorite recipes.");
        }

        return this.recipeAPI.Get(new Map([["id", recipe.id]]))
            .then((recipe) => {
                return this.send(ResponseCodes.OK, res, recipe);
            })
            .catch((error) => {
                return this.send(ResponseCodes.BAD_REQUEST, res, error);
            });
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

        let newFavoriteRecipes: IBaseRecipe[] = [];

        for (let i = 0; i < user.favoriteRecipes.length; i++) {
            if (user.favoriteRecipes[i].id === Number.parseInt(req.params.recipeID)) {
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
