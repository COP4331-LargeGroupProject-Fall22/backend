/**
 * This file is responsible for setting up server and routing api request to their respective routes.
 */
import * as dotenv from 'dotenv';
dotenv.config();

process.env.DB_CONNECTION_STRING = process.env.NODE_ENV === "dev" ?
    process.env.LOCAL_MONGODB_CONNECTION_STRING :
    process.env.MONGODB_CONNECTION_STRING;

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

app.use((req, res, next) => {
  const allowedOrigins = ['http://localhost:8081', 'https://web-frontend-smart-chef.herokuapp.com'];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
       res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', true);
  return next();
});

app.use('/user', userRoute);
app.use('/recipes', recipeRoute)
app.use('/foods', foodRoute);
app.use('/auth', authenticationRoute);

const server = (port: number) => {
    app.listen(port, () => {
        console.log(`🚀 Server is running on port ${port}`);
    });
}

export { app, server };
