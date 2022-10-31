import { Request, Response } from "express";
import IFoodAPI from "../../foodAPI/IFoodAPI";
import ResponseFormatter from "../../utils/ResponseFormatter";
import { ResponseTypes } from "../../utils/ResponseTypes";
import BaseController from "./BaseController";

/**
 * This class creates several properties responsible for food actions 
 * provided to the user.
 */
export default class FoodController extends BaseController {
    private foodAPI: IFoodAPI;

    constructor(foodAPI: IFoodAPI) {
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
        let parameters = new Map<string, any>([
            ["id", req.params.foodID]
        ]);

        return this.foodAPI.Get(parameters).then(food => {
            if (food === null) {
                return this.sendSuccess(404, res, "Ingredient could not be found");
            }

            return this.sendSuccess(200, res, food);
        }, (error) => this.sendError(400, res, this.getException(error)));
    }
}
