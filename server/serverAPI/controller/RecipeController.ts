import { Request, Response } from "express";
import IRecipeAPI from "../../recipeAPI/IRecipeAPI";
import ResponseFormatter from "../../utils/ResponseFormatter";
import { ResponseTypes } from "../../utils/ResponseTypes";
import IBaseRecipe from "../model/recipe/IBaseRecipe";
import IRecipe from "../model/recipe/IRecipe";

/**
 * This class creates several properties responsible for authentication actions 
 * provided to the user.
 */
export default class RecipeController {
    private recipeAPI: IRecipeAPI;

    constructor(recipeAPI: IRecipeAPI) {
        this.recipeAPI = recipeAPI;
    }

    private getException(error: unknown): string {
        if (error instanceof Error) {
            return error.message;
        }

        return String(error);
    }
    
    /**
     * Lets client to search recipes using specified parameters provided in the URL.
     * Upon successful operation, this handler will return recipe items. 
     * 
     * @param req Request parameter that holds information about request
     * @param res Response parameter that holds information about response
     */
    searchRecipe = async (req: Request, res: Response) => {
        let parameters = new Map<string, any>([
            ["query", req.query.query]
        ]);

        let recipes: IBaseRecipe[];
        try {
            recipes = await this.recipeAPI.SearchRecipe(parameters);
        } catch(error) {
            res.status(400).json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, this.getException(error)));
            return;
        }

        res.status(200).json(ResponseFormatter.formatAsJSON(ResponseTypes.SUCCESS, recipes));
    }

    /**
     * Lets client to get information about specific recipe using specified parameters provided in the URL.
     * Upon successful operation, this handler will return recipe item. 
     * 
     * @param req Request parameter that holds information about request
     * @param res Response parameter that holds information about response
     */
     getRecipe = async (req: Request, res: Response) => {
        let parameters = new Map<string, any>([
            ["id", req.params.recipeID]
        ]);

        let recipe: Partial<IRecipe | null>;
        try {
            recipe = await this.recipeAPI.GetRecipe(parameters);
        } catch(error) {
            res.status(400).json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, this.getException(error)));
            return;
        }

        if (recipe === null) {
            res.status(404).json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, "Couldn't find recipe."));
            return;
        }

        res.status(200).json(ResponseFormatter.formatAsJSON(ResponseTypes.SUCCESS, recipe));
    }   
}