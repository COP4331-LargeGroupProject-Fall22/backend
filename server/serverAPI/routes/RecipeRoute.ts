/**
 * This file is responsible for construction of the routes for RecipeController.
 */

import express from "express";

import UserDatabase from "../../database/UserDatabase";

import SpoonacularIngredientAPI from "../../ingredientAPI/SpoonacularAPI/SpoonacularIngredientAPI";
import SpoonacularRecipeAPI from "../../recipeAPI/spoonacularAPI/SpoonacularRecipeAPI";

import TokenCreator from "../../utils/TokenCreator";

import AuthorizedRecipeController from "../controller/AuthorizedRecipeController";
import RecipeController from "../controller/RecipeController";

import JWTAuthenticator from "../middleware/authentication/JWTAuthenticator";

import IIdentification from "../model/internal/user/IIdentification";

export const recipeRoute = express.Router();

let apiKey = process.env.SPOONACULAR_API_KEY;
let apiHost = process.env.SPOONACULAR_HOST;

let databaseURL = process.env.DB_CONNECTION_STRING;
let databaseName = process.env.DB_NAME;
let collectionName = process.env.DB_USERS_COLLECTION;

let spoonacularApiKey = process.env.SPOONACULAR_API_KEY;
let spoonacularApiHost = process.env.SPOONACULAR_HOST;

let privateKey = process.env.PRIVATE_KEY_FOR_USER_TOKEN;

const recipeController = new RecipeController(
    new SpoonacularRecipeAPI(
        apiKey,
        apiHost,
        new SpoonacularIngredientAPI(apiKey, apiHost)
    )
);

const database = UserDatabase.connect(
    databaseURL,
    databaseName,
    collectionName,
);

const ingredientAPI = new SpoonacularIngredientAPI(spoonacularApiKey, spoonacularApiHost);
const recipeAPI = new SpoonacularRecipeAPI(spoonacularApiKey, spoonacularApiHost, ingredientAPI);

const authenticator = new JWTAuthenticator().authenticate(new TokenCreator<IIdentification>(privateKey));

const authorizedRecipeController = new AuthorizedRecipeController(database, recipeAPI);

recipeRoute.use(async function (req, res, next) {
    if (req.headers.authorization !== undefined) {
        authenticator(req, res, next);
    } else {
        next();
    } 
});

recipeRoute.get('/', function(req, res) {
    if (req.serverUser !== undefined) {
        return authorizedRecipeController.getAll(req, res);
    } else {
        return recipeController.getAll(req, res);
    }
});

recipeRoute.get("/:recipeID", function(req, res) {
    if (req.serverUser !== undefined) {
        return authorizedRecipeController.get(req, res);
    } else {
        return recipeController.get(req, res);
    }
});
