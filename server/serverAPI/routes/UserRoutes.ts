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
import IUserIdentification from '../model/user/IUserIdentification';

export const userRoute = express.Router();

let databaseURL = process.env.DB_CONNECTION_STRING;
let databaseName = process.env.DB_NAME;
let collectionName = process.env.DB_USERS_COLLECTION;

const database = UserDatabase.connect(
    databaseURL,
    databaseName,
    collectionName,
);

const userController = new UserController(database);
const inventoryController = new InventoryController(database);
let privateKey = process.env.PRIVATE_KEY_FOR_USER_TOKEN;

userRoute.use(new JWTAuthenticator().authenticate(new TokenCreator<IUserIdentification>(privateKey)));

userRoute.get('/', userController.getUsers);
userRoute.get('/user', userController.getUser);
userRoute.route('/user')
    .delete(userController.deleteUser)
    .put(express.urlencoded({ extended: true }), userController.updateUser);

userRoute.get('/user/foods', inventoryController.getInventory);
userRoute.post('/user/foods/food', express.urlencoded({ extended: true }), inventoryController.addFood);
userRoute.get('/user/foods/food/:foodID', inventoryController.getFood);
userRoute.put('/user/foods/food/:foodID', express.urlencoded({ extended: true }), inventoryController.updateFood);
userRoute.delete('/user/foods/food/:foodID', inventoryController.deleteFood);
