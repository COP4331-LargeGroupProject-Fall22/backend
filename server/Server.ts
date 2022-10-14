/**
 * Entry point of the Food API.
 * This file is responsible for starting server and routing api request to their respective routes.
 */
import * as dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import path from 'path';

import { Logger } from './logger/Logger';
import { userRoute } from './routes/UserRoutes';
import { authenticationRoute } from './routes/AuthenticationRoutes';

const server = express();

server.listen(5000, () => {
    console.log('🚀 Server is running');
});

server.use(Logger.consoleLog);
server.use(express.static(path.resolve(__dirname, './api/view/html/public')));

server.use('/api', userRoute);
server.use('/auth', authenticationRoute);

server.all('*', (req, res) => {
    res.status(404).send('<h1> resource not found </h1>');
});
