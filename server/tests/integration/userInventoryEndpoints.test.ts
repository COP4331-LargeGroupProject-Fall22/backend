import * as dotenv from 'dotenv';
dotenv.config();

import { NextFunction, Request, Response } from "express";
import supertest from "supertest";
import { app } from "../../App";
import UserDatabase from "../../database/UserDatabase";
import IInventoryIngredient from '../../serverAPI/model/food/IInventoryIngredient';
import IIdentification from '../../serverAPI/model/user/IIdentification';
import IUser from '../../serverAPI/model/user/IUser';

let mockUser: IUser = {
    inventory: [],
    firstName: 'Mikhail',
    lastName: 'Plekunov',
    lastSeen: Date.now(),
    password: '123',
    username: 'Mekromic',
    shoppingCart: []
};

let mockServerUser: IIdentification = {
    username: mockUser.username
};

let mockFoodID: number;
let mockFakeFoodID: number;

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

jest.mock('../../serverAPI/middleware/logger/Logger', () => {
    return {
        consoleLog: (req: Request, res: Response, next: NextFunction) => { next(); }
    };
});

let databaseURL = (global as any).__MONGO_URI__;
let databaseName = process.env.DB_NAME!;
let collectionName = process.env.DB_USERS_COLLECTION!;

UserDatabase.connect(databaseURL, databaseName, collectionName);

let mockFood: IInventoryIngredient;
let mockUpdatedFood: IInventoryIngredient;
let mockUpdatedFoodResponse: IInventoryIngredient;

describe(`User inventory endpoints`, () => {
    beforeAll(() => {
        mockFoodID = 123321;
        mockFakeFoodID = 123;

        mockFood = {
            expirationDate: 99999,
            id: mockFoodID,
            name: "FoodItemA",
            category: "CatA",
            quantityUnits: ['g'],
        };

        mockUpdatedFood = {
            expirationDate: 77777,
            id: mockFoodID,
            name: "FoodItemB",
            category: "CatB",
            quantityUnits: ['g'],
        };

        mockUpdatedFoodResponse = {
            expirationDate: 77777,
            id: mockFoodID,
            name: "FoodItemA",
            category: "CatA",
            quantityUnits: ['g'],
        };
    });

    describe('Create Food Requests', () => {
        it(`Create Food Item in user's inventory (food item is unique)`, async () => {
            await UserDatabase.getInstance()?.Create(mockUser);

            let response = await supertest(app)
                .post(`/user/inventory`)
                .send(mockFood)

            expect(response.statusCode).toBe(200);
            expect(response.body.data).toMatchObject([mockFood]);
        });

        it(`Create Food Item in user's inventory (food item is not unique)`, async () => {
            let response = await supertest(app)
                .post(`/user/inventory`)
                .send(mockFood);

            expect(response.statusCode).toBe(400);
        });
    });

    describe('Get Food Requests', () => {
        it(`Get Food Item from user's inventory (food item doesn't exist)`, async () => {
            let response = await supertest(app)
                .get(`/user/inventory/${mockFakeFoodID}`);

            expect(response.statusCode).toBe(404);
        });

        it(`Get Food Item from user's inventory`, async () => {
            let response = await supertest(app)
                .get(`/user/inventory/${mockFoodID}`);

            expect(response.statusCode).toBe(200);
            expect(response.body.data).toMatchObject(mockFood);
        });

        it(`Get all Food Items from user's inventory`, async () => {
            let response = await supertest(app)
                .get(`/user/inventory`);

            expect(response.statusCode).toBe(200);
            expect(response.body.data).toMatchObject([mockFood]);
        });
    });

    describe(`Update Food Requests`, () => {
        it(`Update Food Item from user's inventory (food item doesn't exist)`, async () => {
            let response = await supertest(app)
                .put(`/user/inventory/${mockFakeFoodID}`)
                .send(mockUpdatedFood);

            expect(response.statusCode).toBe(404);
        });

        it(`Update Food Item from user's inventory`, async () => {
            let response = await supertest(app)
                .put(`/user/inventory/${mockFoodID}`)
                .send(mockUpdatedFood);

            expect(response.statusCode).toBe(200);
            expect(response.body.data).toMatchObject([mockUpdatedFoodResponse]);
        });
    });

    describe(`Delete Food Requests`, () => {
        it(`Delete Food Item from user's inventory (food item doesn't exist)`, async () => {
            let response = await supertest(app)
                .delete(`/user/inventory/${mockFakeFoodID}`);

            expect(response.statusCode).toBe(404);
        });

        it(`Delete Food Item from user's inventory`, async () => {
            let response = await supertest(app)
                .delete(`/user/inventory/${mockFoodID}`);

            expect(response.statusCode).toBe(200);
            expect(response.body.data).toStrictEqual([]);
        });
    });
});

afterAll(async () => {
    UserDatabase.getInstance()?.disconnect();
});
