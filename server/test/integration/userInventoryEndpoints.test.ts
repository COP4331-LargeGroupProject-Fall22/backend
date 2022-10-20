import * as dotenv from 'dotenv';
dotenv.config();

import { NextFunction, Request, Response } from "express";
import supertest from "supertest";
import { app } from "../../App";
import { UserDatabase } from "../../database/UserDatabase";
import IFoodItem from "../../serverAPI/model/food/IFoodItem";
import { IUser } from "../../serverAPI/model/user/IUser";

let mockUser: IUser;
let mockUserUpdated: Partial<IUser>;

let mockFood: IFoodItem;
let mockFoodUpdated: IFoodItem;

let mockFoodID: number;

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
        }
    
        mockUser = {
            firstName: "Mikhail",
            lastName: "Plekunov",
            uid: "123op02osiao30kn1",
            lastSeen: 12345213567,
            inventory: []
        };
    
        mockUserUpdated = {
            firstName: "Alex",
            lastName: "The Great",
            uid: "123lk02psiao30412"
        };
    });

    describe('Create Food Requests', () => {
        it(`Create Food Item in user's inventory`, async () => {
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
    });
    
    describe('Get Food Requests', () => {
        it(`Get Food Item from user's inventory`, async () => {
            let response = await supertest(app)
                .get(`/users/user/${(mockUser as any)._id}/foods/food/${mockFoodID}`);
    
            expect(response.statusCode).toBe(200);
            expect(response.body.data).toMatchObject(mockFood);
        });
    
        it(`Get Food inventory`, async () => {
            let response = await supertest(app)
                .get(`/users/user/${(mockUser as any)._id}/foods`);
    
            expect(response.statusCode).toBe(200);
            expect(response.body.data).toMatchObject([mockFood]);
        });
    });
    
    describe(`Update Food Requests`, () => {
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
        it(`Delete Food Item from user's inventory`, async () => {
            let response = await supertest(app)
                .delete(`/users/user/${(mockUser as any)._id}/foods/food/${mockFoodID}`);
    
            expect(response.statusCode).toBe(200);
            expect(response.body.data).toStrictEqual([]);
        });
    });

    afterAll(() => {
        UserDatabase.getInstance()?.disconnect();
    });
});
