import { Request, Response } from "express";
import IFoodAPI from "../../foodAPI/IFoodAPI";

/**
 * This class creates several properties responsible for authentication actions 
 * provided to the user.
 */
export default class FoodController {
    private foodAPI: IFoodAPI;

    constructor(foodAPI: IFoodAPI) {
        this.foodAPI = foodAPI;
    }

    /**
     * This property is a handler that is used for "getFood" action of the user.
     * It provides user with an ability to get complete information about specific food item in the FoodAPI.
     * 
     * @param req Request parameter that holds information about request
     * @param res Response parameter that holds information about response
     */    
    getFood = async (req: Request, res: Response) => {
        let parameters = new Map<string, any>([
            ["id", req.params.id]
        ]);
        
        this.foodAPI.GetFood(parameters)
            .then(foods => res.status(200).json(foods));
    }

    /**
     * This property is a handler that is used for "getFoods" action of the user.
     * It provides user with an ability to search for all food items that satisfy query parameters in the FoodAPI.
     * 
     * @param req Request parameter that holds information about request
     * @param res Response parameter that holds information about response
     */        
    getFoods = async (req: Request, res: Response) => {
        let parameters = new Map<string, any>();

        if (req.query?.query !== undefined) {
            parameters.set("query", req.query.query);
        }

        if (req.query?.pageNumber !== undefined) {
            parameters.set("offset", req.query.pageNumber);
        }

        if (req.query?.size !== undefined) {
            parameters.set("number", req.query.size);
        }

        this.foodAPI.GetFoods(parameters)
            .then(food => res.status(200).json(food));
    }
}
