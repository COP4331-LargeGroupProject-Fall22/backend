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

import IIdentification from '../../serverAPI/model/internal/user/IIdentification';
import UserSchema from '../../serverAPI/model/internal/user/UserSchema';
import UnitSchema from '../../serverAPI/model/internal/unit/UnitSchema';

import { unitConverterApiResponse } from './responses/unitConverter/unitConverterApiResponse';

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

import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import IShoppingIngredient from '../../serverAPI/model/internal/ingredient/IShoppingIngredient';
import AddRequestSchema from '../../serverAPI/model/external/requests/shoppingList/AddRequest';
import ImageSchema from '../../serverAPI/model/internal/image/ImageSchema';
import PriceSchema from '../../serverAPI/model/internal/money/PriceSchema';

import { ingredientGetApiResponse } from './responses/ingredients/ingredientGetApiResponse';

let mockAxios = new MockAdapter(axios);

let mockItemID: string;

let converterBaseUrl = process.env.SPOONACULAR_CONVERTER_BASE_URL;
let getIngredientBaseUrl: string;

let mockQuantity: any;
let mockAddIngredientRequest: any;

beforeAll(async () => {
    mockQuantity = {
        unit: unitConverterApiResponse.targetUnit, 
        value: unitConverterApiResponse.targetAmount
    };

    mockAddIngredientRequest = {
        id: 1117,
        name: "TestIngredient",
        category: "TestCategory",
        quantityUnits: ["kg", "g"],
        quantity: new UnitSchema(unitConverterApiResponse.targetUnit, unitConverterApiResponse.targetAmount),
        imageUrl: 'google.com',
        price: 13.21
    };

    getIngredientBaseUrl = process.env.SPOONACULAR_INGREDIENTS_BASE_URL + `/${mockAddIngredientRequest.id}/information`;

    await UserDatabase.getInstance()?.Create(mockVerifiedUser);
});

describe(`Shopping list`, () => {
    describe('Add responses', () => {
        it('Add ingredient (correct ingredient information)', async () => {
            let response = await supertest(app)
                .post(`/user/shopping-list`)
                .send(mockAddIngredientRequest);

            mockItemID = response.body[0].itemID;
            expect(response.statusCode).toBe(ResponseCodes.CREATED);
        });
    });

    describe('GetAll responses', () => {
        it('Get ingredients', async () => {
            let response = await supertest(app)
                .get(`/user/shopping-list`);

            expect(response.statusCode).toBe(ResponseCodes.OK);
        });
    });

    describe('Get responses', () => {
        it('Get ingredient', async () => {
            let response = await supertest(app)
                .get(`/user/shopping-list/${mockItemID}`);

            expect(response.statusCode).toBe(ResponseCodes.OK);
        });
    });

    describe('Update responses', () => {
        it('Update ingredient', async () => {
            mockAxios.onGet(converterBaseUrl).reply(ResponseCodes.OK, unitConverterApiResponse);
            mockAxios.onGet(getIngredientBaseUrl).reply(ResponseCodes.OK, ingredientGetApiResponse);

            let response = await supertest(app)
                .put(`/user/shopping-list/${mockItemID}`)
                .send(mockQuantity);

            expect(response.statusCode).toBe(ResponseCodes.OK);
        });
    });

    describe('Delete responses', () => {
        it('Delete ingredient', async () => {
            let response = await supertest(app)
                .delete(`/user/shopping-list/${mockItemID}`);

            expect(response.statusCode).toBe(ResponseCodes.OK);
        });
    });
});

afterAll(async () => {
    UserDatabase.getInstance()?.disconnect();
});
