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
    username: 'Mekromic'
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

describe(`User inventory endpoints`, () => {
    beforeAll(() => {
        mockFoodID = 123321;
        mockFakeFoodID = 123;

        mockFood = {
            expirationDate: 99999,
            id: mockFoodID,
            name: "FoodItemA",
            category: "CatA",
            nutrients: [
                {
                    name: "nutrientC",
                    unit: {
                        unit: "g",
                        value: 20
                    },
                    percentOfDaily: 10.4
                }
            ]
        };

        mockUpdatedFood = {
            expirationDate: 77777,
            id: mockFoodID,
            name: "FoodItemB",
            category: "CatB",
            nutrients: [
                {
                    name: "nutrientA",
                    unit: {
                        unit: "grams",
                        value: 123
                    },
                    percentOfDaily: 12.4
                }
            ]
        };
    });

    describe('Create Food Requests', () => {
        it(`Create Food Item in user's inventory (food item is unique)`, async () => {
            await UserDatabase.getInstance()?.Create(mockUser);

            let response = await supertest(app)
                .post(`/users/user/foods/food`)
                .send(`name=${mockFood.name}`)
                .send(`category=${mockFood.category}`)
                .send(`nutrients=${JSON.stringify(mockFood.nutrients)}`)
                .send(`expirationDate=${mockFood.expirationDate}`)
                .send(`id=${mockFood.id}`);

            expect(response.statusCode).toBe(200);
            expect(response.body.data).toMatchObject([mockFood]);
        });

        it(`Create Food Item in user's inventory (food item is not unique)`, async () => {
            let response = await supertest(app)
                .post(`/users/user/foods/food`)
                .send(`name=${mockFood.name}`)
                .send(`category=${mockFood.category}`)
                .send(`nutrients=${JSON.stringify(mockFood.nutrients)}`)
                .send(`expirationDate=${mockFood.expirationDate}`)
                .send(`id=${mockFood.id}`);

            expect(response.statusCode).toBe(400);
        });
    });

    describe('Get Food Requests', () => {
        it(`Get Food Item from user's inventory (food item doesn't exist)`, async () => {
            let response = await supertest(app)
                .get(`/users/user/foods/food/${mockFakeFoodID}`);

            expect(response.statusCode).toBe(400);
        });

        it(`Get Food Item from user's inventory`, async () => {
            let response = await supertest(app)
                .get(`/users/user/foods/food/${mockFoodID}`);

            expect(response.statusCode).toBe(200);
            expect(response.body.data).toMatchObject(mockFood);
        });

        it(`Get all Food Items from user's inventory`, async () => {
            let response = await supertest(app)
                .get(`/users/user/foods`);

            expect(response.statusCode).toBe(200);
            expect(response.body.data).toMatchObject([mockFood]);
        });
    });

    describe(`Update Food Requests`, () => {
        it(`Update Food Item from user's inventory (food item doesn't exist)`, async () => {
            let response = await supertest(app)
                .put(`/users/user/foods/food/${mockFakeFoodID}`)
                .send(`id=${mockFood.id}`)
                .send(`name=${mockFood.name}`)
                .send(`category=${mockFood.category}`)
                .send(`nutrients=${JSON.stringify(mockFood.nutrients)}`)
                .send(`expirationDate=${mockFood.expirationDate}`);

            expect(response.statusCode).toBe(404);
        });

        it(`Update Food Item from user's inventory`, async () => {
            let response = await supertest(app)
                .put(`/users/user/foods/food/${mockFoodID}`)
                .send(`id=${mockUpdatedFood.id}`)
                .send(`name=${mockUpdatedFood.name}`)
                .send(`category=${mockUpdatedFood.category}`)
                .send(`nutrients=${JSON.stringify(mockUpdatedFood.nutrients)}`)
                .send(`expirationDate=${mockUpdatedFood.expirationDate}`);

            expect(response.statusCode).toBe(200);
            expect(response.body.data).toMatchObject([mockUpdatedFood]);
        });
    });

    describe(`Delete Food Requests`, () => {
        it(`Delete Food Item from user's inventory (food item doesn't exist)`, async () => {
            let response = await supertest(app)
                .delete(`/users/user/foods/food/${mockFakeFoodID}`);

            expect(response.statusCode).toBe(404);
        });

        it(`Delete Food Item from user's inventory`, async () => {
            let response = await supertest(app)
                .delete(`/users/user/foods/food/${mockFoodID}`);

            expect(response.statusCode).toBe(200);
            expect(response.body.data).toStrictEqual([]);
        });
    });
});

afterAll(async () => {
    UserDatabase.getInstance()?.disconnect();
});
