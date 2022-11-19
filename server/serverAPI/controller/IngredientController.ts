import { Request, Response } from "express";
import IIngredientAPI from "../../ingredientAPI/IIngredientAPI";
import { ResponseCodes } from "../../utils/ResponseCodes";
import BaseController from "./BaseController/BaseController";

/**
 * This class creates several properties responsible for ingredient actions 
 * provided to the user.
 */
export default class IngredientController extends BaseController {
    private ingredientAPI: IIngredientAPI;

    constructor(ingredientAPI: IIngredientAPI) {
        super();
        this.ingredientAPI = ingredientAPI;
    }

    // TODO(#57): Add support for finding ingredient items by UPC
    /**
     * Gets information about specific ingredient defined by UPC parameter provided in the URL.
     * 
     * @param req Request parameter that holds information about request.
     * @param res Response parameter that holds information about response.
     */
    getByUPC = async (req: Request, res: Response) => {
        throw new Error("Not implemented yet.");
    }

    /**
     * Searches for ingredients using query.
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

        return this.ingredientAPI.GetAll(parameters)
            .then(ingredients => this.send(ResponseCodes.OK, res, ingredients),
                (error) => this.send(ResponseCodes.BAD_REQUEST, res, this.getException(error)));
    }

    /**
     * Gets information about specific ingredient defined by ingredientID parameter provided in the URL.
     * 
     * @param req Request parameter that holds information about request
     * @param res Response parameter that holds information about response
     */
    get = async (req: Request, res: Response) => {
        let parameters = new Map<string, any>();

        parameters.set("id", req.params.ingredientID);

        if (req.query?.quantity !== undefined) {
            parameters.set("quantity", req.query.quantity);
        }

        if (req.query?.unit !== undefined) {
            parameters.set("unit", req.query.unit);
        }

        return this.ingredientAPI.Get(parameters).then(ingredient => {
            if (ingredient === null) {
                return this.send(ResponseCodes.NOT_FOUND, res, "Ingredient could not be found");
            }

            return this.send(ResponseCodes.OK, res, ingredient);
        }, (error) => this.send(ResponseCodes.BAD_REQUEST, res, this.getException(error)));
    }
}
