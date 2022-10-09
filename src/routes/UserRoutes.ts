import express from 'express';
import { UserController } from '../api/controller/UserController';
import { MongoDB } from '../database/MongoDB';

export const userRoute = express.Router();

const userController = new UserController(new MongoDB().connectToDatabase());

userRoute.get('/', userController.getUsers);
userRoute.get('/:username', userController.getUser);
userRoute.post('/', express.urlencoded({extended: true}), userController.postUser);
userRoute.route('/:id').delete(userController.deleteUser).put(express.urlencoded({extended: true}), userController.updateUser);
