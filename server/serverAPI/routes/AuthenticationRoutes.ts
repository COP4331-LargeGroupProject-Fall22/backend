/**
 * This file is responsible for construction of the routes for AuthenticationController.
 */

import express from 'express';

import AuthenticationController from '../controller/AuthenticationController';

import UserDatabase from '../../database/UserDatabase';

import Encryptor from '../../utils/Encryptor';
import TokenCreator from '../../utils/TokenCreator';

import JWTAuthenticator from '../middleware/authentication/JWTAuthenticator';

import SendGridAPI from '../../emailAPI/sendGridAPI/SendGridAPI';

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
    new SendGridAPI(process.env.SENDGRID_API_KEY),
    new Encryptor(),
    new TokenCreator(privateKey)
);

const authenticator = new JWTAuthenticator().authenticate(new TokenCreator(privateKey));

authenticationRoute.use(express.json({ limit: '30mb' }));

authenticationRoute.post("/login", authenticationController.login);
authenticationRoute.post("/register", authenticationController.register);
authenticationRoute.get("/logout", authenticator, authenticationController.logout);

authenticationRoute.post("/refreshJWT", authenticationController.refreshJWT);

authenticationRoute.post("/send-verification-code", authenticationController.sendVerificationCode);
authenticationRoute.post("/confirm-verification-code", authenticationController.confirmVerificationCode);

authenticationRoute.post("/request-password-reset", authenticationController.requestPasswordReset);
authenticationRoute.post("/perform-password-reset", authenticationController.performPasswordReset);
