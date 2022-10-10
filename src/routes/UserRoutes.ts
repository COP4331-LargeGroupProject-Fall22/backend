import express from 'express';
import { UserController } from '../api/controller/UserController';
import { MongoDB } from '../database/MongoDB';
import { Authenticator } from '../authentication/Authenticator';

export const userRoute = express.Router();

const userController = new UserController(MongoDB.connectToDatabase());

userRoute.use(new Authenticator().authenticate);

userRoute.get('/users', userController.getUsers);
userRoute.get('/user/:id', userController.getUser);
userRoute.route('/user/:id')
    .delete(userController.deleteUser)
    .put(express.urlencoded({ extended: true }), userController.updateUser);
