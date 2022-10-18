/**
 * Entry point of the Food API.
 * This file is responsible for setting up server and routing api request to their respective routes.
 */
 import * as dotenv from 'dotenv';
 dotenv.config();
 
 import express from 'express';
 import path from 'path';
 
 import Logger from './logger/Logger';
 import { userRoute } from './routes/UserRoutes';
 import { authenticationRoute } from './routes/AuthenticationRoutes';
 
 const app = express();
 
 const server = (port: number) => {
     app.listen(port, () => {
         console.log(`🚀 Server is running on port ${port}`);
     });
 }
 
 app.use(Logger.consoleLog);
 app.use(express.static(path.resolve(__dirname, './api/view/html/public')));
 
 app.use('/api', userRoute);
 app.use('/auth', authenticationRoute);
 
 app.all('*', (req, res) => {
     res.status(404).send('<h1> resource not found </h1>');
 });
 
 export { app, server };
 