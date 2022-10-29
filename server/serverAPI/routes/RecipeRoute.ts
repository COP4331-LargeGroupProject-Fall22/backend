/**
 * This file is responsible for construction of the routes for RecipeController.
 */

import express from "express";
import SpoonacularFoodAPI from "../../foodAPI/SpoonacularAPI/SpoonacularFoodAPI";
import SpoonacularRecipeAPI from "../../recipeAPI/spoonacularAPI/SpoonacularRecipeAPI";
import RecipeController from "../controller/RecipeController";


export const recipeRoute = express.Router();

let apiKey = process.env.SPOONACULAR_API_KEY;
let apiHost = process.env.SPOONACULAR_HOST;

const recipeController = new RecipeController(
    new SpoonacularRecipeAPI(
        apiKey, 
        apiHost,
        new SpoonacularFoodAPI(apiKey, apiHost)
    )
);

recipeRoute.get('/', recipeController.getAll)
recipeRoute.get('/recipe/:recipeID',recipeController.get);
