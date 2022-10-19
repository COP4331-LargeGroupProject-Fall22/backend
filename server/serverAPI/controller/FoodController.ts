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
     * It provides user with an ability to search for specified food in the FoodAPI.
     * 
     * @param req Request parameter that holds information about request
     * @param res Response parameter that holds information about response
     */    
    getFood = async (req: Request, res: Response) => {
        let parameters = new Map<string, any>([
            ["query", req.query.query],
            ["pageSize", req.query?.pageSize],
            ["pageNumber", req.query?.pageNumber]
        ]);
        
        this.foodAPI.GetFood(parameters)
            .then(foods => res.status(200).json(foods));
    }
}
