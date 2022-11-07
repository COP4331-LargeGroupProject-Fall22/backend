import { Request, Response } from "express";
import IIngredientAPI from "../../ingredientAPI/IIngredientAPI";
import ResponseFormatter from "../../utils/ResponseFormatter";
import { ResponseTypes } from "../../utils/ResponseTypes";
import BaseController from "./BaseController";

/**
 * This class creates several properties responsible for food actions 
 * provided to the user.
 */
export default class IngredientController extends BaseController {
    private foodAPI: IIngredientAPI;

    constructor(foodAPI: IIngredientAPI) {
        super();
        this.foodAPI = foodAPI;
    }

    // TODO(#57): Add support for finding food items by UPC
    /**
     * Gets information about specific food defined by UPC parameter provided in the URL.
     * 
     * @param req Request parameter that holds information about request.
     * @param res Response parameter that holds information about response.
     */
    getByUPC = async (req: Request, res: Response) => {
        throw new Error("Not implemented yet.");
    }

    /**
     * Searches for foods using query.
     * 
     * @param req Request parameter that holds information about request.
     * @param res Response parameter that holds information about response.
     */
    getAll = async (req: Request, res: Response) => {
        let parameters = new Map<string, any>();

        if (req.query?.ingredientName !== undefined) {
            parameters.set("ingredientName", req.query.ingredientName);
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

        return this.foodAPI.GetAll(parameters)
            .then(foods => this.sendSuccess(200, res, foods),
                (error) => this.sendSuccess(400, res, this.getException(error)));
    }

    /**
     * Gets information about specific food defined by foodID parameter provided in the URL.
     * 
     * @param req Request parameter that holds information about request
     * @param res Response parameter that holds information about response
     */
    get = async (req: Request, res: Response) => {
        let parameters = new Map<string, any>();

        parameters.set("id", req.params.foodID);

        if (req.query?.quantity !== undefined) {
            parameters.set("quantity", req.query.quantity);
        }

        if (req.query?.unit !== undefined) {
            parameters.set("unit", req.query.unit);
        }

        return this.foodAPI.Get(parameters).then(food => {
            if (food === null) {
                return this.sendSuccess(404, res, "Ingredient could not be found");
            }

            return this.sendSuccess(200, res, food);
        }, (error) => this.sendError(400, res, this.getException(error)));
    }
}
