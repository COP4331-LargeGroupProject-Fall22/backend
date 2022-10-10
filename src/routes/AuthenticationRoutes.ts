import express from 'express';
import { AuthenticationController } from '../api/controller/AuthenticationController';
import { Authenticator } from '../authentication/Authenticator';
import { MongoDB } from '../database/MongoDB';

export const authenticationRoute = express.Router();

const authenticationController = new AuthenticationController(MongoDB.connectToDatabase());

authenticationRoute.use(express.urlencoded({ extended: true }));
authenticationRoute.use(new Authenticator().authenticate);

authenticationRoute.get("/login", authenticationController.login);
authenticationRoute.post("/register", authenticationController.register);
