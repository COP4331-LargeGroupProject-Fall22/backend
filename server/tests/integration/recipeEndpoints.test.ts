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

import { recipeSearchResponse } from './responses/recipes/recipeSearchResponse';
import { recipeSearchAPIResponse } from './responses/recipes/recipeSearchAPIResponse';
import { recipeGetResponse } from './responses/recipes/recipeGetResponse';
import { recipeGetAPIResponse } from './responses/recipes/recipeGetAPIResponse';

let searchResponse: any;
let searchApiResponse: any;

let getResponse: any;
let getAPIResponse: any;

let searchURL: string;
let getURL: string;

let mockRecipeID: number;

beforeAll(() => {
    searchResponse = recipeSearchResponse;
    searchApiResponse = recipeSearchAPIResponse;
    searchURL = `${process.env.SPOONACULAR_RECIPE_BASE_URL}/complexSearch`;

    mockRecipeID = 532245;

    getResponse = recipeGetResponse;
    getAPIResponse = recipeGetAPIResponse;
    getURL = `${process.env.SPOONACULAR_RECIPE_BASE_URL}/${mockRecipeID}/information`
});

describe('Recipe endpoints', () => {
    beforeEach(() => {
        mockAxios.reset();
    });

    describe('GetAll responses', () => {
        it('Get recipes using correct query', async () => {
            mockAxios.onGet(searchURL).reply(200, searchResponse);
            mockAxios.onGet(process.env.SPOONACULAR_INGREDIENTS_BASE_URL + "/autocomplete").reply(200, []);

            let response = await supertest(app)
                .get(`/recipes?recipeName=pasta`);

            expect(response.body.data).toMatchObject(searchApiResponse);
        });
    });

    describe('Get responses', () => {
        it('Get Recipe item using correct id', async () => {
            mockAxios.onGet(getURL).reply(200, getResponse);
            mockAxios.onGet(process.env.SPOONACULAR_INGREDIENTS_BASE_URL + "/autocomplete").reply(200, []);

            let response = await supertest(app)
                .get(`/recipes/${mockRecipeID}`);

            expect(response.body.data).toMatchObject(getAPIResponse)
        });
    });
});

afterAll(() => {
    UserDatabase.getInstance()?.disconnect();
})