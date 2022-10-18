/**
 * This file is responsible for construction of the routes for UserController.
 */
import express from 'express';
import { UserController } from '../api/controller/UserController';
import { UserDatabase } from '../database/UserDatabase';
import Authenticator from '../authentication/Authenticator';

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

userRoute.get('/users', userController.getUsers);
userRoute.get('/user/:id', userController.getUser);
userRoute.route('/user/:id')
    .delete(userController.deleteUser)
    .put(express.urlencoded({ extended: true }), userController.updateUser);
