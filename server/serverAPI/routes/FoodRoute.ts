/**
 * This file is responsible for construction of the routes for FoodController.
 */

import express from "express";
import SpoonacularFoodAPI from "../../foodAPI/SpoonacularAPI/SpoonacularFoodAPI";
import FoodController from "../controller/FoodController";

export const foodRoute = express.Router();

const foodController = new FoodController(
    new SpoonacularFoodAPI()
);

// TODO(#55): change routes
foodRoute.get('/', foodController.searchFood)
foodRoute.get('/food/:foodID',foodController.getFood);
foodRoute.get('/food/upc/:upc', foodController.getFoodByUPC);
