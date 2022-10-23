"use strict";
/**
 * This file is responsible for construction of the routes for FoodController.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.foodRoute = void 0;
const express_1 = __importDefault(require("express"));
const SpoonacularFoodAPI_1 = __importDefault(require("../../foodAPI/SpoonacularAPI/SpoonacularFoodAPI"));
const FoodController_1 = __importDefault(require("../controller/FoodController"));
exports.foodRoute = express_1.default.Router();
const foodController = new FoodController_1.default(new SpoonacularFoodAPI_1.default(process.env.SPOONACULAR_API_KEY));
exports.foodRoute.get('/', foodController.getFoods);
exports.foodRoute.get('/food/:foodID', foodController.getFood);
exports.foodRoute.get('/food/upc/:upc', foodController.getFoodByUPC);
//# sourceMappingURL=FoodRoute.js.map