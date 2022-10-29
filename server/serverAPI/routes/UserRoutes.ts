/**
 * This file is responsible for construction of the routes for UserController.
 */

import * as dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import UserController from '../controller/UserController';
import UserDatabase from '../../database/UserDatabase';
import Authenticator from '../middleware/authentication/Authenticator';
import InventoryController from '../controller/InventoryController';

export const userRoute = express.Router();

let databaseURL = process.env.DB_CONNECTION_STRING;
let databaseName = process.env.DB_NAME;
let collectionName = process.env.DB_USERS_COLLECTION;

const database = UserDatabase.connect(
    databaseURL,
    databaseName,
    collectionName
);

const userController = new UserController(database);
const inventoryController = new InventoryController(database);

userRoute.use(new Authenticator().authenticate);
// TODO(#55): change routes

userRoute.get('/', userController.getUsers);
userRoute.get('/user/:userID', userController.getUser);
userRoute.route('/user/:userID')
    .delete(userController.deleteUser)
    .put(express.urlencoded({ extended: true }), userController.updateUser);

userRoute.get('/user/:userID/foods', inventoryController.getFoods);
userRoute.post('/user/:userID/foods/food', express.urlencoded({ extended: true }), inventoryController.addFood);
userRoute.get('/user/:userID/foods/food/:foodID', inventoryController.getFood);
userRoute.put('/user/:userID/foods/food/:foodID', express.urlencoded({ extended: true }), inventoryController.updateFood);
userRoute.delete('/user/:userID/foods/food/:foodID', inventoryController.deleteFood);
