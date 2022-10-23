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
 import { foodRoute } from './serverAPI/routes/FoodRoute';

 const app = express();
 
 app.use(Logger.consoleLog);

 if (process.env.NODE_ENV === 'production') {
    // app.use(express.static('frontend/build'));
    app.use(express.static(path.resolve(__dirname, './serverAPI/view/html/public')));

    app.get('*', (req,res) => {
        res.sendFile(path.resolve(__dirname, './serverAPI/view/html/public/index.html'));
    });
    // app.get('*', (req, res) => {
    //     res.sendFile(path.resolve(__dirname, './server', 'build', 'index.html'));
    // })
 }
 
 app.use('/users', userRoute);
 app.use('/foods', foodRoute);
 app.use('/auth', authenticationRoute);

 const server = (port: number) => {
    app.listen(port, () => {
        console.log(`🚀 Server is running on port ${port}`);
    });
}

 export { app, server };

