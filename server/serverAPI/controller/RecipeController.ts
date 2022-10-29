import { Request, Response } from "express";
import IRecipeAPI from "../../recipeAPI/IRecipeAPI";
import ResponseFormatter from "../../utils/ResponseFormatter";
import { ResponseTypes } from "../../utils/ResponseTypes";

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
    getAll = async (req: Request, res: Response) => {
        let parameters = new Map<string, any>([
            ["query", req.query.query]
        ]);

        return this.recipeAPI.GetAll(parameters).then(recipes => {
            return res.status(200)
                .json(ResponseFormatter.formatAsJSON(ResponseTypes.SUCCESS, recipes));
        }, (error) => {
            return res.status(400)
                .json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, this.getException(error)));
        });
    }

    /**
     * Lets client to get information about specific recipe using specified parameters provided in the URL.
     * Upon successful operation, this handler will return recipe item. 
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
                return res.status(404)
                    .json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, "Couldn't find recipe."));
            }

            return res.status(200)
                .json(ResponseFormatter.formatAsJSON(ResponseTypes.SUCCESS, recipe));
        }, (error) => {
            return res.status(400)
                .json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, this.getException(error)));
        })
    }
}
