import { Request, Response } from "express";
import IRecipeAPI from "../../recipeAPI/IRecipeAPI";
import ResponseFormatter from "../../utils/ResponseFormatter";
import { ResponseTypes } from "../../utils/ResponseTypes";
import BaseController from "./BaseController";

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

        if (req.query?.query !== undefined) {
            parameters.set("query", req.query.query);
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

        return this.recipeAPI.GetAll(parameters).then(recipes => {
            return this.sendSuccess(200, res, recipes);
        }, (error) => this.sendSuccess(400, res, this.getException(error)));
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
                return this.sendError(404, res,  "Recipe could not be found.");
            }

            return this.sendSuccess(200, res, recipe);
        }, (error) => this.sendError(400, res, this.getException(error)));
    }
}
