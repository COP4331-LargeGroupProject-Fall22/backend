/**
 * This file is responsible for setting up server and routing api request to their respective routes.
 */
import * as dotenv from 'dotenv';
dotenv.config();

process.env.DB_CONNECTION_STRING = process.env.NODE_ENV === "dev" ?
    process.env.LOCAL_MONGODB_CONNECTION_STRING :
    process.env.MONGODB_CONNECTION_STRING;

import express from 'express';

import Logger from './serverAPI/middleware/logger/Logger';

import { userRoute } from './serverAPI/routes/UserRoutes';
import { authenticationRoute } from './serverAPI/routes/AuthenticationRoutes';
import { ingredientRoute } from './serverAPI/routes/IngredientRoute';
import { recipeRoute } from './serverAPI/routes/RecipeRoute';

const app = express();

app.use(Logger.consoleLog);

const cors = require("cors");

var corsOptions = {
    origin: true
};

app.use(cors(corsOptions));

app.use('/user', userRoute);
app.use('/recipes', recipeRoute)
app.use('/ingredients', ingredientRoute);
app.use('/auth', authenticationRoute);

const server = (port: number) => {
    app.listen(port, () => {
        console.log(`🚀 Server is running on port ${port}`);
    });
}

export { app, server };
