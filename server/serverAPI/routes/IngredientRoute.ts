/**
 * This file is responsible for construction of the routes for FoodController.
 */

import express from "express";
import SpoonacularIngredientAPI from "../../ingredientAPI/SpoonacularAPI/SpoonacularFoodAPI";
import IngredientController from "../controller/IngredientController";

export const ingredientRoute = express.Router();

let apiKey = process.env.SPOONACULAR_API_KEY;
let apiHost = process.env.SPOONACULAR_HOST;

const ingredientController = new IngredientController(
    new SpoonacularIngredientAPI(apiKey, apiHost)
);

ingredientRoute.get('/', ingredientController.getAll)
ingredientRoute.get('/:ingredientID',ingredientController.get);
ingredientRoute.get('/upc/:upc', ingredientController.getByUPC);
