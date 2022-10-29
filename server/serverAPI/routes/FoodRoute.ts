/**
 * This file is responsible for construction of the routes for FoodController.
 */

import express from "express";
import SpoonacularFoodAPI from "../../foodAPI/SpoonacularAPI/SpoonacularFoodAPI";
import FoodController from "../controller/FoodController";

export const foodRoute = express.Router();

let apiKey = process.env.SPOONACULAR_API_KEY;
let apiHost = process.env.SPOONACULAR_HOST;

const foodController = new FoodController(
    new SpoonacularFoodAPI(apiKey, apiHost)
);

foodRoute.get('/', foodController.getAll)
foodRoute.get('/food/:foodID',foodController.get);
foodRoute.get('/food/upc/:upc', foodController.getByUPC);
