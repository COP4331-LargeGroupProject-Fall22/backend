/**
 * This file is responsible for construction of the routes for FoodController.
 */

import express from "express";
import FoodAPI from "../../foodAPI/FoodAPI";
import FoodController from "../controller/FoodController";

export const foodRoute = express.Router();

let foodDataCentralApiKey = process.env.FOOD_DATA_CENTRAL_API_KEY;

const foodController = new FoodController(
    new FoodAPI(
        foodDataCentralApiKey
    )
);

foodRoute.get('/food',foodController.getFood);
