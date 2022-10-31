import * as dotenv from 'dotenv';
dotenv.config();

import { NextFunction, Request, Response } from 'express';

import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import supertest from 'supertest';
import { foodResponse } from './responses/foodResponse';
import { foodsResponse } from './responses/foodsResponse';
import UserDatabase from '../../database/UserDatabase';

jest.mock('../../serverAPI/middleware/logger/Logger', () => {
    return {
        consoleLog: (req: Request, res: Response, next: NextFunction) => { next(); }
    };
});

let mockAxios = new MockAdapter(axios);
let getFoodsBaseURL: string;
let getFoodBaseURL: string;

let foodID: number;

let food: any;
let foods: any;

let mockFoodID: number;
let mockIncorrectFoodID: number;

let databaseURL = (global as any).__MONGO_URI__;
let databaseName = process.env.DB_NAME!;
let collectionName = process.env.DB_USERS_COLLECTION!;

UserDatabase.connect(databaseURL, databaseName, collectionName);

import { app } from '../../App';
import { foodsEndpointResponse } from './responses/foodsEndpointResponse';
import { foodEndpointResponse } from './responses/foodEndpointResponse';

describe('Food endpoints', () => {
    beforeAll(() => {
        foodID = JSON.parse(foodResponse).id;

        food = foodResponse;
        foods = foodsResponse;

        mockFoodID = 123123;

        mockIncorrectFoodID = -123;

        getFoodsBaseURL = process.env.SPOONACULAR_INGREDIENTS_BASE_URL + "/autocomplete";
        getFoodBaseURL = process.env.SPOONACULAR_INGREDIENTS_BASE_URL + `/${foodID}/information`;
    });

    describe('Get Requests', () => {
        it('Get Food items using correct query', async () => {
            mockAxios.onGet(getFoodsBaseURL).reply(200, foods);

            let response = await supertest(app)
                .get(`/foods?query=yogurt`);

            expect(response.body.data).toMatchObject(foodsEndpointResponse);
        });

        it('Get Food items without query parameters', async () => {
            let response = await supertest(app)
            .get(`/foods`);

            expect(response.statusCode).toBe(400);
        })

        it('Get Food Item using correct query', async () => {
            mockAxios.onGet(getFoodBaseURL).reply(200, food);

            let response = await supertest(app)
                .get(`/foods/${foodID}`);

            expect(response.body.data).toMatchObject(foodEndpointResponse);
        });

        it('Get Food Item with incorrect foodID', async () => {
            mockAxios.onGet(getFoodBaseURL).reply(200, food);

            let response = await supertest(app)
                .get(`/foods/${mockIncorrectFoodID}`);

            expect(response.statusCode).toBe(400);
        });

        it('Get Food Item with non-existant foodID', async () => {
            mockAxios.onGet(getFoodBaseURL).reply(200, food);

            let response = await supertest(app)
                .get(`/foods/${mockFoodID}`);

            expect(response.statusCode).toBe(404);
        });
    });

    afterAll(() => {
        mockAxios.restore();
        UserDatabase.getInstance()?.disconnect();
    });
});
