import * as dotenv from 'dotenv';
dotenv.config();

import { NextFunction, Request, Response } from "express";
import { MongoClient } from 'mongodb';
import supertest from "supertest";
import { app } from "../../App";
import UserDatabase from "../../database/UserDatabase";

import ShoppingIngredientSchema from '../../serverAPI/model/food/requestSchema/ShoppingIngredient';
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

describe(`User shopping cart endpoints`, () => {
    beforeAll(async () => {
        await UserDatabase.getInstance()?.Create(mockUser);
    });

    describe('Create Requests', () => {
        it(`Create Ingredient Item in user's shopping cart (food item is unique and belongs to some recipe)`, async () => {
            let ingredient = new ShoppingIngredientSchema(
                123,
                "test",
                "catA",
                ["g", "kg"],
                {
                    unit: "g",
                    value: 123
                },
                12343
            );

            let response = await supertest(app)
                .post(`/user/shopping-cart`)
                .send(ingredient);

            expect(response.statusCode).toBe(200);
        });

        it(`Create Ingredient Item in user's shopping cart (food item is unique and doesn't belong to any recipe)`, async () => {
            let ingredient = new ShoppingIngredientSchema(
                123,
                "test",
                "catA",
                ["g", "kg"],
                {
                    unit: "g",
                    value: 123
                }
            );

            let response = await supertest(app)
                .post(`/user/shopping-cart`)
                .send(ingredient);

            expect(response.statusCode).toBe(200);
        });

        it(`Create Ingredient Item in user's shopping cart (food item is not unique and belong to some recipe)`, async () => {
            let ingredient = new ShoppingIngredientSchema(
                123,
                "test",
                "catA",
                ["g", "kg"],
                {
                    unit: "g",
                    value: 123
                },
                12343
            );

            let response = await supertest(app)
                .post(`/user/shopping-cart`)
                .send(ingredient);


            expect(response.statusCode).toBe(400);
        });

        it(`Create Ingredient Item in user's shopping cart (food item is not unique and doesn't belong to any recipe)`, async () => {
            let ingredientA = new ShoppingIngredientSchema(
                1234,
                "test",
                "catA",
                ["g", "kg"],
                {
                    unit: "g",
                    value: 123
                }
            );

            let response = await supertest(app)
                .post(`/user/shopping-cart`)
                .send(ingredientA);

            expect(response.statusCode).toBe(200);

            response = await supertest(app)
                .post(`/user/shopping-cart`)
                .send(ingredientA);

            expect(response.statusCode).toBe(200);

            expect(response.body.data.quantity.unit).toBe(ingredientA.quantity.unit);
            expect(response.body.data.quantity.value).toBe(ingredientA.quantity.value * 2);
        });
    });
});

afterAll(async () => {
    UserDatabase.getInstance()?.disconnect();
});
