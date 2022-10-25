"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ResponseFormatter_1 = __importDefault(require("../../utils/ResponseFormatter"));
const ResponseTypes_1 = require("../../utils/ResponseTypes");
/**
 * This class creates several properties responsible for authentication actions
 * provided to the user.
 */
class FoodController {
    constructor(foodAPI) {
        /**
         * Lets client to get information about specific food defined by foodID parameter provided in the URL.
         * Upon successful operation, this handler will return full information about food.
         *
         * @param req Request parameter that holds information about request
         * @param res Response parameter that holds information about response
         */
        this.getFood = async (req, res) => {
            let foodID = Number.parseInt(req.params.foodID);
            if (Number.isNaN(foodID) || foodID < 0) {
                res.status(400).json(ResponseFormatter_1.default.formatAsJSON(ResponseTypes_1.ResponseTypes.ERROR, "Invlid foodID."));
                return;
            }
            let parameters = new Map([
                ["id", foodID]
            ]);
            let food = await this.foodAPI.GetFood(parameters);
            if (food === null) {
                res.status(404).json(ResponseFormatter_1.default.formatAsJSON(ResponseTypes_1.ResponseTypes.ERROR, "Food item hasn't been found"));
                return;
            }
            res.status(200).json(ResponseFormatter_1.default.formatAsJSON(ResponseTypes_1.ResponseTypes.SUCCESS, food));
        };
        /**
         * Lets client to get information about specific food defined by UPC parameter provided in the URL.
         * Upon successful operation, this handler will return full information about food.
         *
         * @param req Request parameter that holds information about request
         * @param res Response parameter that holds information about response
         */
        this.getFoodByUPC = async (req, res) => {
            throw new Error("Not implemented yet.");
        };
        /**
         * Lets client to search for foods using query.
         * Upon successful operation, this handler will return all foods that satisfy search query.
         *
         * @param req Request parameter that holds information about request
         * @param res Response parameter that holds information about response
         */
        this.getFoods = async (req, res) => {
            let parameters = new Map();
            if (req.query?.query === undefined) {
                res.status(400).json(ResponseFormatter_1.default.formatAsJSON(ResponseTypes_1.ResponseTypes.ERROR, "Query is missing."));
                return;
            }
            parameters.set("query", req.query.query);
            if (req.query?.size !== undefined) {
                parameters.set("number", req.query.size);
            }
            if (req.query?.intolerence !== undefined) {
                parameters.set("intolerence", req.query.intolerences);
            }
            let foods = await this.foodAPI.GetFoods(parameters);
            res.status(200).json(ResponseFormatter_1.default.formatAsJSON(ResponseTypes_1.ResponseTypes.SUCCESS, foods));
        };
        this.foodAPI = foodAPI;
    }
}
exports.default = FoodController;
//# sourceMappingURL=FoodController.js.map