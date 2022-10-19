/**
 * This file is responsible for construction of the routes for FoodController.
 */

import express from "express";
import SpoonacularAPI from "../../foodAPI/SpoonacularAPI/SpoonacularAPI";
import FoodController from "../controller/FoodController";

export const foodRoute = express.Router();

const foodController = new FoodController(
    new SpoonacularAPI(
        process.env.SPOONACULAR_API_KEY
    )
);

foodRoute.get('/', foodController.getFoods)
foodRoute.get('/food/:id',foodController.getFood);
