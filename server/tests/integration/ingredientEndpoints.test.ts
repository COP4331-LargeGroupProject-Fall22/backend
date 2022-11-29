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

jest.mock('../../serverAPI/middleware/logger/Logger', () => {
    return {
        consoleLog: (req: Request, res: Response, next: NextFunction) => { next(); }
    };
});

let mockAxios = new MockAdapter(axios);

let getIngredientsBaseURL: string;
let getIngredientBaseURL: string;

let ingredientID: number;

import { ingredientGetResponseDefault } from './responses/ingredients/ingredientGetResponse';
import { ingredientGetAllResponse } from './responses/ingredients/ingredientGetAllResponse';
import { ingredientGetAllApiRespose } from './responses/ingredients/ingredientGetAllApiResponse';
import { ingredientGetApiResponse } from './responses/ingredients/ingredientGetApiResponse';

beforeAll(() => {
    ingredientID = ingredientGetResponseDefault.id;

    getIngredientsBaseURL = process.env.SPOONACULAR_INGREDIENTS_BASE_URL + "/autocomplete";
    getIngredientBaseURL = process.env.SPOONACULAR_INGREDIENTS_BASE_URL + `/${ingredientID}/information`;
});

describe('Ingredients', () => {
    describe('GetAll responses', () => {
        it('Get ingredients using correct query', async () => {
            mockAxios.onGet(getIngredientsBaseURL).reply(ResponseCodes.OK, ingredientGetAllApiRespose);

            let response = await supertest(app)
                .get(`/ingredients?ingredientName=yogurt`);

            expect(response.body).toMatchObject(ingredientGetAllResponse);
            expect(response.statusCode).toBe(ResponseCodes.OK);
        });

        it('Get ingredients without query parameters', async () => {
            let response = await supertest(app)
                .get(`/ingredients`);

            expect(response.statusCode).toBe(ResponseCodes.BAD_REQUEST);
        })
    });

    describe('Get responses', () => {
        it('Get ingredient using correct query', async () => {
            mockAxios.onGet(getIngredientBaseURL).reply(ResponseCodes.OK, ingredientGetApiResponse);
    
            let response = await supertest(app)
                .get(`/ingredients/${ingredientID}`);
    
            expect(response.body).toMatchObject(ingredientGetResponseDefault);
            expect(response.statusCode).toBe(ResponseCodes.OK);
        });
    
        it('Get ingredient with incorrect ingredientID', async () => {
            mockAxios.onGet(getIngredientBaseURL).reply(ResponseCodes.OK, ingredientGetApiResponse);
    
            let response = await supertest(app)
                .get(`/ingredients/-123`);
    
            expect(response.statusCode).toBe(ResponseCodes.BAD_REQUEST);
        });
    
        it('Get ingredient with non-existant ingredientID', async () => {
            mockAxios.onGet(getIngredientBaseURL).reply(ResponseCodes.OK, ingredientGetAllApiRespose);
    
            let response = await supertest(app)
                .get(`/ingredients/123123123123123123`);
    
            expect(response.statusCode).toBe(ResponseCodes.BAD_REQUEST);
        });
    });

    afterAll(() => {
        mockAxios.restore();
        UserDatabase.getInstance()?.disconnect();
    });
});
