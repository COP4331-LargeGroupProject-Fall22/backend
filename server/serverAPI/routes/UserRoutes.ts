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

let privateKey = process.env.PRIVATE_KEY_FOR_USER_TOKEN;

userRoute.use(new JWTAuthenticator().authenticate(new TokenCreator<IIdentification>(privateKey)));

userRoute.route('/')
    .get(userController.get)
    .delete(userController.delete)
    .put(express.urlencoded({ extended: true }), userController.update);

userRoute.get('/inventory', inventoryController.getAll);
userRoute.post('/inventory', express.urlencoded({ extended: true }), inventoryController.add);
userRoute.get('/inventory/:foodID', inventoryController.get);
userRoute.put('/inventory/:foodID', express.urlencoded({ extended: true }), inventoryController.update);
userRoute.delete('/inventory/:foodID', inventoryController.delete);
