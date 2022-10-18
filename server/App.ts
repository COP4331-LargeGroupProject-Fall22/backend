/**
 * Entry point of the Food API.
 * This file is responsible for setting up server and routing api request to their respective routes.
 */
 import * as dotenv from 'dotenv';
 dotenv.config();
 
 import express from 'express';
 import path from 'path';
 
 import Logger from './serverAPI/middleware/logger/Logger';
 import { userRoute } from './serverAPI/routes/UserRoutes';
 import { authenticationRoute } from './serverAPI/routes/AuthenticationRoutes';
 
 const app = express();
 
 app.use(Logger.consoleLog);
 app.use(express.static(path.resolve(__dirname, './serverAPI/view/html/public')));
 
 app.use('/', userRoute);
 app.use('/auth', authenticationRoute);
 
 const server = (port: number) => {
    app.listen(port, () => {
        console.log(`🚀 Server is running on port ${port}`);
    });
}

 export { app, server };
 

 