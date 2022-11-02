/**
 * This file is responsible for construction of the routes for AuthenticationController.
 */

import express from 'express';
import AuthenticationController from '../controller/AuthenticationController';
import UserDatabase from '../../database/UserDatabase';
import Encryptor from '../../utils/Encryptor';
import TokenCreator from '../../utils/TokenCreator';

export const authenticationRoute = express.Router();

let databaseURL = process.env.DB_CONNECTION_STRING;
let databaseName = process.env.DB_NAME;
let collectionName = process.env.DB_USERS_COLLECTION;
let privateKey = process.env.PRIVATE_KEY_FOR_USER_TOKEN;

const authenticationController = new AuthenticationController(
    UserDatabase.connect(
        databaseURL,
        databaseName,
        collectionName
    ),
    new Encryptor(),
    new TokenCreator(privateKey)
);

authenticationRoute.use(express.urlencoded({ extended: true }));

authenticationRoute.post("/login", authenticationController.login);
authenticationRoute.post("/register", authenticationController.register);
