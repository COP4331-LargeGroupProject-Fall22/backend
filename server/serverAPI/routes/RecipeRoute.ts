/**
 * This file is responsible for construction of the routes for RecipeController.
 */

import express from "express";
import SpoonacularFoodAPI from "../../foodAPI/SpoonacularAPI/SpoonacularFoodAPI";
import SpoonacularRecipeAPI from "../../recipeAPI/spoonacularAPI/SpoonacularRecipeAPI";
import RecipeController from "../controller/RecipeController";


export const recipeRoute = express.Router();

const recipeController = new RecipeController(
    new SpoonacularRecipeAPI(
        new SpoonacularFoodAPI()
    )
);

recipeRoute.get('/', recipeController.searchRecipe)
recipeRoute.get('/recipe/:recipeID',recipeController.getRecipe);
