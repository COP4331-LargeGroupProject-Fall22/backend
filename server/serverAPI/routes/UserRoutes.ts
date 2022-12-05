/**
 * This file is responsible for construction of the routes for UserController.
 */

import * as dotenv from 'dotenv';
dotenv.config();

import express from 'express';

import UserController from '../controller/UserController';
import InventoryController from '../controller/InventoryController';
import FavoriteRecipeController from '../controller/FavoriteRecipeController';
import UserProfilePictureController from '../controller/UserProfilePictureController';
import ShoppingListController from '../controller/ShoppingListController';
import AllergenController from '../controller/AllergenController';

import UserDatabase from '../../database/UserDatabase';

import JWTAuthenticator from '../middleware/authentication/JWTAuthenticator';

import TokenCreator from '../../utils/TokenCreator';

import IIdentification from '../model/internal/user/IIdentification';

import FreeImageHostAPI from '../../imageAPI/freeImageHostAPI/FreeImageHostAPI';
import SpoonacularRecipeAPI from '../../recipeAPI/spoonacularAPI/SpoonacularRecipeAPI';
import SpoonacularIngredientAPI from '../../ingredientAPI/SpoonacularAPI/SpoonacularIngredientAPI';

export const userRoute = express.Router();

let databaseURL = process.env.DB_CONNECTION_STRING;
let databaseName = process.env.DB_NAME;
let collectionName = process.env.DB_USERS_COLLECTION;

let spoonacularApiKey = process.env.SPOONACULAR_API_KEY;
let spoonacularApiHost = process.env.SPOONACULAR_HOST;

let freeImageHostApiKey = process.env.FREE_IMAGE_HOST_API_KEY;

let privateKey = process.env.PRIVATE_KEY_FOR_USER_TOKEN;

const database = UserDatabase.connect(
    databaseURL,
    databaseName,
    collectionName,
);

const ingredientAPI = new SpoonacularIngredientAPI(spoonacularApiKey, spoonacularApiHost);
const recipeAPI = new SpoonacularRecipeAPI(spoonacularApiKey, spoonacularApiHost, ingredientAPI);

const userController = new UserController(database);
const inventoryController = new InventoryController(
    database
);
const shoppingListController = new ShoppingListController(
    database,
    ingredientAPI
);
const userProfilePictureController = new UserProfilePictureController(
    database,
    new FreeImageHostAPI(freeImageHostApiKey)
);
const allergenController = new AllergenController(database);
const favoriteRecipesController = new FavoriteRecipeController(
    database,
    new SpoonacularRecipeAPI(
        spoonacularApiKey, 
        spoonacularApiHost,
        ingredientAPI
    )
);

userRoute.use(new JWTAuthenticator().authenticate(new TokenCreator<IIdentification>(privateKey)));

userRoute.use(express.json({ limit: '30mb' }));

userRoute.route('/')
    .get(userController.get)
    .delete(userController.delete)
    .put(express.json(), userController.update);

userRoute.get('/inventory', inventoryController.getAll);
userRoute.post('/inventory', express.json(), inventoryController.add);
userRoute.get('/inventory/:ingredientID', inventoryController.get);
userRoute.put('/inventory/:ingredientID', express.json(), inventoryController.update);
userRoute.delete('/inventory/:ingredientID', inventoryController.delete);

userRoute.get('/shopping-list', shoppingListController.getAll);
userRoute.post('/shopping-list', express.json(), shoppingListController.add);
userRoute.get('/shopping-list/:itemID', shoppingListController.get);
userRoute.put('/shopping-list/:itemID', express.json(), shoppingListController.update);
userRoute.delete('/shopping-list/:itemID', shoppingListController.delete);

userRoute.get('/profile-picture', userProfilePictureController.get);
userRoute.post('/profile-picture', userProfilePictureController.add);
userRoute.delete('/profile-picture', userProfilePictureController.delete);

userRoute.get('/allergens', allergenController.getAll);
userRoute.get('/allergens/:ingredientID', allergenController.get);
userRoute.post('/allergens', express.json(), allergenController.add);
userRoute.delete('/allergens/:ingredientID', allergenController.delete);

userRoute.get('/favorite-recipes', favoriteRecipesController.getAll);
userRoute.get('/favorite-recipes/:recipeID', favoriteRecipesController.get);
userRoute.post('/favorite-recipes', express.json(), favoriteRecipesController.add);
userRoute.delete('/favorite-recipes/:recipeID', favoriteRecipesController.delete);
