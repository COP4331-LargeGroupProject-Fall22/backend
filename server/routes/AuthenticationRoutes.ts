/**
 * This file is responsible for construction of the routes for AuthenticationController.
 */
import express from 'express';
import { AuthenticationController } from '../api/controller/AuthenticationController';
import Authenticator from '../authentication/Authenticator';
import { UserDatabase } from '../database/UserDatabase';

export const authenticationRoute = express.Router();

let databaseURL = process.env.DB_CONNECTION_STRING;
let databaseName = process.env.DB_NAME;
let collectionName = process.env.DB_USERS_COLLECTION;

const authenticationController = new AuthenticationController(
    UserDatabase.connect(
        databaseURL,
        databaseName,
        collectionName
    )
);

authenticationRoute.use(express.urlencoded({ extended: true }));
authenticationRoute.use(new Authenticator().authenticate);

authenticationRoute.get("/login", authenticationController.login);
authenticationRoute.post("/register", authenticationController.register);
