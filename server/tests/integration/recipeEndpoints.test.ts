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

import { recipeGetAllApiResponse } from './responses/recipes/recipeGetAllApiResponse';
import { recipeGetAllResponse } from './responses/recipes/recipeGetAllResponse';
import { recipeGetApiResponse } from './responses/recipes/recipeGetApiResponse';
import { recipeGetResponse } from './responses/recipes/recipeGetResponse';

let getAllURL: string;
let getURL: string;

let mockRecipeID: number;

beforeAll(() => {
    mockRecipeID = recipeGetResponse.id;

    getAllURL = `${process.env.SPOONACULAR_RECIPE_BASE_URL}/complexSearch`;
    getURL = `${process.env.SPOONACULAR_RECIPE_BASE_URL}/${mockRecipeID}/information`
});

describe('Recipe endpoints', () => {
    beforeEach(() => {
        mockAxios.reset();
    });

    describe('GetAll responses', () => {
        it('Get recipes using correct query', async () => {
            mockAxios.onGet(getAllURL).reply(ResponseCodes.OK, recipeGetAllApiResponse);

            let response = await supertest(app)
                .get(`/recipes?recipeName=pasta`);

            expect(response.body).toMatchObject(recipeGetAllResponse);
            expect(response.statusCode).toBe(ResponseCodes.OK);
        });
    });

    describe('Get responses', () => {
        it('Get recipe using correct id', async () => {
            mockAxios.onGet(getURL).reply(ResponseCodes.OK, recipeGetApiResponse);

            let response = await supertest(app)
                .get(`/recipes/${mockRecipeID}`);

            expect(response.body).toMatchObject(recipeGetResponse)
        });

        it('Get recipe using incorrect recipeID', async () => {
            mockAxios.onGet(getURL).reply(ResponseCodes.OK, recipeGetApiResponse);

            let response = await supertest(app)
                .get(`/recipes/123`);

            expect(response.statusCode).toBe(ResponseCodes.BAD_REQUEST);
        });

        it('Get recipe using non-existant recipeID', async () => {
            mockAxios.onGet(getURL).reply(ResponseCodes.OK, recipeGetApiResponse);

            let response = await supertest(app)
                .get(`/recipes/-123`);

            expect(response.statusCode).toBe(ResponseCodes.BAD_REQUEST);
        });
    });
});

afterAll(() => {
    UserDatabase.getInstance()?.disconnect();
})