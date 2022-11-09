/**
 * This file is responsible for construction of the routes for UserController.
 */

import * as dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import UserController from '../controller/UserController';
import UserDatabase from '../../database/UserDatabase';
import InventoryController from '../controller/InventoryController';
import JWTAuthenticator from '../middleware/authentication/JWTAuthenticator';
import TokenCreator from '../../utils/TokenCreator';
import IIdentification from '../model/user/IIdentification';
import SpoonacularFoodAPI from '../../foodAPI/SpoonacularAPI/SpoonacularFoodAPI';
import ShoppingCartController from '../controller/ShoppingListController';

export const userRoute = express.Router();

let databaseURL = process.env.DB_CONNECTION_STRING;
let databaseName = process.env.DB_NAME;
let collectionName = process.env.DB_USERS_COLLECTION;

let apiKey = process.env.SPOONACULAR_API_KEY;
let apiHost = process.env.SPOONACULAR_HOST;

const database = UserDatabase.connect(
    databaseURL,
    databaseName,
    collectionName,
);

const userController = new UserController(database);
const inventoryController = new InventoryController(
    database,
    new SpoonacularFoodAPI(apiKey, apiHost)
);
const shoppingCartController = new ShoppingCartController(
    database,
    new SpoonacularFoodAPI(apiKey, apiHost)
);

let privateKey = process.env.PRIVATE_KEY_FOR_USER_TOKEN;

userRoute.use(new JWTAuthenticator().authenticate(new TokenCreator<IIdentification>(privateKey)));

userRoute.route('/')
    .get(userController.get)
    .delete(userController.delete)
    .put(express.json(), userController.update);

userRoute.get('/inventory', inventoryController.getAll);
userRoute.post('/inventory', express.json(), inventoryController.add);
userRoute.get('/inventory/:ingredientID', inventoryController.get);
userRoute.put('/inventory/:ingredientID', express.json(), inventoryController.update);
userRoute.delete('/inventory/:ingredientID', inventoryController.delete);

userRoute.get('/shopping-cart', shoppingCartController.getAll);
userRoute.post('/shopping-cart', express.json(), shoppingCartController.add);
userRoute.get('/shopping-cart/:itemID', shoppingCartController.get);
userRoute.put('/shopping-cart/:itemID', express.json(), shoppingCartController.update);
userRoute.delete('/shopping-cart/:itemID', shoppingCartController.delete);
