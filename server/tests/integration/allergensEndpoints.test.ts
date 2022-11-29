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

let mockAddAllergenRequest: any;

beforeAll(async () => {
    mockAddAllergenRequest = {
        id: 1117,
        name: "TestIngredient",
        category: "TestCategory",
        imageUrl: 'google.com'
    };

    await UserDatabase.getInstance()?.Create(mockVerifiedUser);
});

describe(`Allergens`, () => {
    describe('Add responses', () => {
        it('Add allergen (correct ingredient information)', async () => {
            let response = await supertest(app)
                .post(`/user/allergens`)
                .send(mockAddAllergenRequest);

            expect(response.statusCode).toBe(ResponseCodes.CREATED);
        });
    });

    describe('GetAll responses', () => {
        it('Get allergen', async () => {
            let response = await supertest(app)
                .get(`/user/allergens`);

            expect(response.statusCode).toBe(ResponseCodes.OK);
        });
    });

    describe('Get responses', () => {
        it('Get ingredient', async () => {
            let response = await supertest(app)
                .get(`/user/allergens/${mockAddAllergenRequest.id}`);

            expect(response.statusCode).toBe(ResponseCodes.OK);
        });
    });

    describe('Delete responses', () => {
        it('Delete ingredient', async () => {
            let response = await supertest(app)
                .delete(`/user/allergens/${mockAddAllergenRequest.id}`);

            expect(response.statusCode).toBe(ResponseCodes.OK);
        });
    });
});

afterAll(async () => {
    UserDatabase.getInstance()?.disconnect();
});
