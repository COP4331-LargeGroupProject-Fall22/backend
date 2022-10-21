import * as dotenv from 'dotenv';
dotenv.config();

import { NextFunction, Request, Response } from "express";
import supertest from "supertest";
import { app } from "../../App";
import UserDatabase from "../../database/UserDatabase";
import IFoodItem from "../../serverAPI/model/food/IFoodItem";
import IUser from "../../serverAPI/model/user/IUser";

let mockUser: IUser;

let mockFood: IFoodItem;
let mockFoodUpdated: IFoodItem;

let mockFoodID: number;
let mockFakeFoodID: number;

let mockUserID: string;
let mockFakeUserID: string;
let mockIncorrectUserID: string;

jest.mock('../../serverAPI/middleware/authentication/Authenticator', () => {
    return function () {
        return {
            authenticate: (req: Request, res: Response, next: NextFunction) => { next(); }
        };
    }
});

jest.mock('../../serverAPI/middleware/logger/Logger', () => {
    return {
        consoleLog: (req: Request, res: Response, next: NextFunction) => { next(); }
    };
});

let databaseURL = (global as any).__MONGO_URI__;
let databaseName = process.env.DB_NAME;
let collectionName = process.env.DB_USERS_COLLECTION;

UserDatabase.connect(databaseURL, databaseName, collectionName);

describe(`User inventory endpoints`, () => {
    beforeAll(() => {
        mockFoodID = 123321;
        mockFakeFoodID = 123;

        mockUserID = '634de9e4938f784f15998696';
        mockFakeUserID = '634de9e4938f784f15998696';
        mockIncorrectUserID = "123";

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

        mockFoodUpdated = {
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

        mockUser = {
            firstName: "Mikhail",
            lastName: "Plekunov",
            uid: "123op02osiao30kn1",
            lastSeen: 12345213567,
            inventory: []
        };
    });

    describe('Create Food Requests', () => {
        it(`Create Food Item in user's inventory (user id doesn't exist)`, async () => {
            let response = await supertest(app)
                .post(`/users/user/${mockFakeUserID}/foods/food`)
                .send(`name=${mockFood.name}`)
                .send(`category=${mockFood.category}`)
                .send(`nutrients=${JSON.stringify(mockFood.nutrients)}`)
                .send(`expirationDate=${mockFood.expirationDate}`)
                .send(`id=${mockFood.id}`);

            expect(response.statusCode).toBe(404);
        });

        it(`Create Food Item in user's inventory (user id has incorrect format)`, async () => {
            let response = await supertest(app)
                .post(`/users/user/${mockIncorrectUserID}/foods/food`)
                .send(`name=${mockFood.name}`)
                .send(`category=${mockFood.category}`)
                .send(`nutrients=${JSON.stringify(mockFood.nutrients)}`)
                .send(`expirationDate=${mockFood.expirationDate}`)
                .send(`id=${mockFood.id}`);

            expect(response.statusCode).toBe(400);
        });

        it(`Create Food Item in user's inventory (food item is unique)`, async () => {
            let expected = await UserDatabase.getInstance()?.CreateUser(mockUser);
            mockUser = expected!;

            let response = await supertest(app)
                .post(`/users/user/${(mockUser as any)._id}/foods/food`)
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
                .post(`/users/user/${(mockUser as any)._id}/foods/food`)
                .send(`name=${mockFood.name}`)
                .send(`category=${mockFood.category}`)
                .send(`nutrients=${JSON.stringify(mockFood.nutrients)}`)
                .send(`expirationDate=${mockFood.expirationDate}`)
                .send(`id=${mockFood.id}`);

            expect(response.statusCode).toBe(400);
        });
    });

    describe('Get Food Requests', () => {
        it(`Get Food Item from user's inventory (user id doesn't exist)`, async () => {
            let response = await supertest(app)
                .get(`/users/user/${mockFakeUserID}/foods/food/${mockFoodID}`);

            expect(response.statusCode).toBe(404);
        });

        it(`Get Food Item from user's inventory (user id has incorrect format)`, async () => {
            let response = await supertest(app)
                .get(`/users/user/${mockIncorrectUserID}/foods/food/${mockFoodID}`);

            expect(response.statusCode).toBe(400);
        });

        it(`Get Food Item from user's inventory (food item doesn't exist)`, async () => {
            let response = await supertest(app)
                .get(`/users/user/${(mockUser as any)._id}/foods/food/${mockFakeFoodID}`);

            expect(response.statusCode).toBe(400);
        });

        it(`Get Food Item from user's inventory`, async () => {
            let response = await supertest(app)
                .get(`/users/user/${(mockUser as any)._id}/foods/food/${mockFoodID}`);

            expect(response.statusCode).toBe(200);
            expect(response.body.data).toMatchObject(mockFood);
        });

        it(`Get all Food Items from user's inventory (user id doesn't exist)`, async () => {
            let response = await supertest(app)
                .get(`/users/user/${mockFakeUserID}/foods`);

            expect(response.statusCode).toBe(404);
        });

        it(`Get all Food Items from user's inventory (user id has incorrect format)`, async () => {
            let response = await supertest(app)
                .get(`/users/user/${mockIncorrectUserID}/foods`);

            expect(response.statusCode).toBe(400);
        });

        it(`Get all Food Items from user's inventory`, async () => {
            let response = await supertest(app)
                .get(`/users/user/${(mockUser as any)._id}/foods`);

            expect(response.statusCode).toBe(200);
            expect(response.body.data).toMatchObject([mockFood]);
        });
    });

    describe(`Update Food Requests`, () => {
        it(`Update Food Item from user's inventory (user id doesn't exist)`, async () => {
            let response = await supertest(app)
                .put(`/users/user/${mockFakeUserID}/foods/food/${mockFoodID}`)
                .send(`id=${mockFoodUpdated.id}`)
                .send(`name=${mockFoodUpdated.name}`)
                .send(`category=${mockFoodUpdated.category}`)
                .send(`nutrients=${JSON.stringify(mockFoodUpdated.nutrients)}`)
                .send(`expirationDate=${mockFoodUpdated.expirationDate}`);

            expect(response.statusCode).toBe(404);
        });

        it(`Update Food Item from user's inventory (user id has incorrect format)`, async () => {
            let response = await supertest(app)
                .put(`/users/user/${mockIncorrectUserID}/foods/food/${mockFoodID}`)
                .send(`id=${mockFoodUpdated.id}`)
                .send(`name=${mockFoodUpdated.name}`)
                .send(`category=${mockFoodUpdated.category}`)
                .send(`nutrients=${JSON.stringify(mockFoodUpdated.nutrients)}`)
                .send(`expirationDate=${mockFoodUpdated.expirationDate}`);

            expect(response.statusCode).toBe(400);
        });

        it(`Update Food Item from user's inventory (food item doesn't exist)`, async () => {
            let response = await supertest(app)
                .put(`/users/user/${(mockUser as any)._id}/foods/food/${mockFakeFoodID}`)
                .send(`id=${mockFoodUpdated.id}`)
                .send(`name=${mockFoodUpdated.name}`)
                .send(`category=${mockFoodUpdated.category}`)
                .send(`nutrients=${JSON.stringify(mockFoodUpdated.nutrients)}`)
                .send(`expirationDate=${mockFoodUpdated.expirationDate}`);

            expect(response.statusCode).toBe(404);
        });

        it(`Update Food Item from user's inventory`, async () => {
            let response = await supertest(app)
                .put(`/users/user/${(mockUser as any)._id}/foods/food/${mockFoodID}`)
                .send(`id=${mockFoodUpdated.id}`)
                .send(`name=${mockFoodUpdated.name}`)
                .send(`category=${mockFoodUpdated.category}`)
                .send(`nutrients=${JSON.stringify(mockFoodUpdated.nutrients)}`)
                .send(`expirationDate=${mockFoodUpdated.expirationDate}`);

            expect(response.statusCode).toBe(200);
            expect(response.body.data).toMatchObject([mockFoodUpdated]);
        });
    });

    describe(`Delete Food Requests`, () => {
        it(`Delete Food Item from user's inventory (user id doesn't exist)`, async () => {
            let response = await supertest(app)
                .delete(`/users/user/${mockFakeUserID}/foods/food/${mockFoodID}`);

            expect(response.statusCode).toBe(404);
        });

        it(`Delete Food Item from user's inventory (user id has incorrect format)`, async () => {
            let response = await supertest(app)
                .delete(`/users/user/${mockIncorrectUserID}/foods/food/${mockFoodID}`);

            expect(response.statusCode).toBe(400);
        });

        it(`Delete Food Item from user's inventory (food item doesn't exist)`, async () => {
            let response = await supertest(app)
                .delete(`/users/user/${(mockUser as any)._id}/foods/food/${mockFakeFoodID}`);

            expect(response.statusCode).toBe(404);
        });

        it(`Delete Food Item from user's inventory`, async () => {
            let response = await supertest(app)
                .delete(`/users/user/${(mockUser as any)._id}/foods/food/${mockFoodID}`);

            expect(response.statusCode).toBe(200);
            expect(response.body.data).toStrictEqual([]);
        });
    });
});

afterAll(async () => {
    UserDatabase.getInstance()?.disconnect();
});
