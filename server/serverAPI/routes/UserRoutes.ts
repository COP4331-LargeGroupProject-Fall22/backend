/**
 * This file is responsible for construction of the routes for UserController.
 */
import express from 'express';
import UserController from '../controller/UserController';
import UserDatabase from '../../database/UserDatabase';
import Authenticator from '../middleware/authentication/Authenticator';

export const userRoute = express.Router();

let databaseURL = process.env.DB_CONNECTION_STRING;
let databaseName = process.env.DB_NAME;
let collectionName = process.env.DB_USERS_COLLECTION;

const userController = new UserController(
    UserDatabase.connect(
        databaseURL,
        databaseName,
        collectionName
    )
);

userRoute.use(new Authenticator().authenticate);

userRoute.get('/', userController.getUsers);
userRoute.get('/user/:userID', userController.getUser);

userRoute.get('/user/:userID/foods', userController.getFoods);
userRoute.post('/user/:userID/foods/food', express.urlencoded({ extended: true }), userController.addFood);
userRoute.get('/user/:userID/foods/food/:foodID', userController.getFood);
userRoute.put('/user/:userID/foods/food/:foodID', express.urlencoded({ extended: true }), userController.updateFood);
userRoute.delete('/user/:userID/foods/food/:foodID', userController.deleteFood);

userRoute.route('/user/:userID')
    .delete(userController.deleteUser)
    .put(express.urlencoded({ extended: true }), userController.updateUser);
