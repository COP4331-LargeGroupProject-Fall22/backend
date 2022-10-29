/**
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
import { recipeRoute } from './serverAPI/routes/RecipeRoute';

const app = express();

app.use(Logger.consoleLog);

app.use(express.static(path.resolve(__dirname, '../frontend/html/public')));

app.use('/users', userRoute);
app.use('/recipes', recipeRoute)
app.use('/foods', foodRoute);
app.use('/auth', authenticationRoute);

const server = (port: number) => {
    app.listen(port, () => {
        console.log(`🚀 Server is running on port ${port}`);
    });
}

export { app, server };
