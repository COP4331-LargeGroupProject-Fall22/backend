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

    /**
     * Lets client to get information about specific food defined by UPC parameter provided in the URL.
     * Upon successful operation, this handler will return full information about food. 
     * 
     * @param req Request parameter that holds information about request
     * @param res Response parameter that holds information about response
     */
    getByUPC = async (req: Request, res: Response) => {
        throw new Error("Not implemented yet.");
    }

    /**
     * Lets client to search for foods using query.
     * Upon successful operation, this handler will return all foods that satisfy search query. 
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

        return this.foodAPI.GetAll(parameters).then(foods => {
            return res.status(200)
                .json(ResponseFormatter.formatAsJSON(ResponseTypes.SUCCESS, foods));
        }, (error) => {
            return res.status(400)
                .json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, this.getException(error)));
        });
    }

    /**
     * Lets client to get information about specific food defined by foodID parameter provided in the URL.
     * Upon successful operation, this handler will return full information about food. 
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
                return res.status(404)
                    .json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, "Food item hasn't been found"));
            }

            return res.status(200)
                .json(ResponseFormatter.formatAsJSON(ResponseTypes.SUCCESS, food));
        }, (error) => {
            return res.status(400)
                .json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, this.getException(error)));
        });
    }    
}
