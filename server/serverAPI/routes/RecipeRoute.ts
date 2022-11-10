/**
 * This file is responsible for construction of the routes for RecipeController.
 */

import express from "express";
import SpoonacularIngredientAPI from "../../ingredientAPI/SpoonacularAPI/SpoonacularIngredientAPI";
import SpoonacularRecipeAPI from "../../recipeAPI/spoonacularAPI/SpoonacularRecipeAPI";
import RecipeController from "../controller/RecipeController";

export const recipeRoute = express.Router();

let apiKey = process.env.SPOONACULAR_API_KEY;
let apiHost = process.env.SPOONACULAR_HOST;

const recipeController = new RecipeController(
    new SpoonacularRecipeAPI(
        apiKey, 
        apiHost,
        new SpoonacularIngredientAPI(apiKey, apiHost)
    )
);

recipeRoute.get('/', recipeController.getAll)
recipeRoute.get('/:recipeID',recipeController.get);
