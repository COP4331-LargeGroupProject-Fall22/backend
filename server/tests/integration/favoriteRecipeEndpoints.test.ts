import * as dotenv from 'dotenv';
dotenv.config();

import { NextFunction, Request, Response } from 'express';
import supertest from 'supertest';

import UserDatabase from '../../database/UserDatabase';

jest.mock('../../serverAPI/middleware/logger/Logger', () => {
    return {
        consoleLog: (req: Request, res: Response, next: NextFunction) => { next(); }
    };
});

let databaseURL = (global as any).__MONGO_URI__;
let databaseName = process.env.DB_NAME!;
let collectionName = process.env.DB_USERS_COLLECTION!;

UserDatabase.connect(databaseURL, databaseName, collectionName);

import { app } from '../../App';
import { ResponseCodes } from '../../utils/ResponseCodes';

import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import IIdentification from '../../serverAPI/model/internal/user/IIdentification';
import UserSchema from '../../serverAPI/model/internal/user/UserSchema';

let mockVerifiedUser = new UserSchema(
    "Mikhail",
    "Plekunov",
    "Mekromic",
    "password",
    "test@gmail.com",
    Date.now()
);
mockVerifiedUser.isVerified = true;

let mockServerUser: IIdentification = {
    username: mockVerifiedUser.username
};

jest.mock('../../serverAPI/middleware/authentication/JWTAuthenticator', () => {
    return function () {
        return {
            authenticate: () => (req: Request, res: Response, next: NextFunction) => {
                (req as any).serverUser = mockServerUser;
                next();
            }
        };
    }
});

import { priceBreakdownApiResponse } from './responses/recipes/priceBreakdownApiResponse';

import { recipeGetApiResponse } from './responses/recipes/recipeGetApiResponse';
import { recipeGetResponse } from './responses/recipes/recipeGetResponse';

let mockAxios = new MockAdapter(axios);

let getUrl: string;
let priceWidgetUrl: string;

let mockAddRecipeRequest: any;

beforeAll(async () => {
    mockAddRecipeRequest = {
        id: recipeGetResponse.id,
        name: recipeGetResponse.name,
        imageUrl: recipeGetResponse.image.srcUrl,
        ingredients: recipeGetResponse.ingredients
    };

    getUrl = `${process.env.SPOONACULAR_RECIPE_BASE_URL}/${mockAddRecipeRequest.id}/information`
    priceWidgetUrl = `${process.env.SPOONACULAR_RECIPE_PRICE_BREAKDOWN_BASE_URL}/${mockAddRecipeRequest.id}/${process.env.SPOONACULAR_RECIPE_PRICE_BREAKDOWN_WIDGET}`;

    await UserDatabase.getInstance()?.Create(mockVerifiedUser);
});

describe(`Favorite Recipes`, () => {
    describe('Add responses', () => {
        it('Add favorite recipe', async () => {
            let response = await supertest(app)
                .post('/user/favorite-recipes')
                .send(mockAddRecipeRequest);
            
            expect(response.statusCode).toBe(ResponseCodes.CREATED);
        });
    });

    describe('GetAll responses', () => {
        it('Get favorite recipes', async () => {
            let response = await supertest(app)
                .get(`/user/favorite-recipes`);

            expect(response.statusCode).toBe(ResponseCodes.OK);
        });
    });

    describe('Get responses', () => {
        it('Get favorite recipe item', async () => {
            mockAxios.onGet(getUrl).reply(ResponseCodes.OK, recipeGetApiResponse);
            mockAxios.onGet(priceWidgetUrl).reply(ResponseCodes.OK, priceBreakdownApiResponse);

            let response = await supertest(app)
                .get(`/user/favorite-recipes/${mockAddRecipeRequest.id}`);
            
            expect(response.statusCode).toBe(ResponseCodes.OK);
        });
    });

    describe('Delete responses', () => {
        it('Delete inventory item', async () => {
            let response = await supertest(app)
                .delete(`/user/favorite-recipes/${mockAddRecipeRequest.id}`);
            
            expect(response.statusCode).toBe(ResponseCodes.OK);
        });
    });
});

afterAll(async () => {
    UserDatabase.getInstance()?.disconnect();
});
