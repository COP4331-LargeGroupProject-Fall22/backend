import * as dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import path from 'path';

import { Logger } from './logger/Logger';
import { userRoute } from './routes/UserRoutes';

const server = express();

server.listen(5000, () => {
    console.log('🚀 Server is running');
});

server.use(Logger.consoleLog);
server.use(express.static(path.resolve(__dirname, './api/view/html/public')));
server.use('/api/users', userRoute);

server.all('*', (req, res) => {
    res.status(404).send('<h1> resource not found </h1>');
});
