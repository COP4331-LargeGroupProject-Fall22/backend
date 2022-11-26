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
import { ingredientGetResponseDefault } from './responses/ingredients/ingredientGetResponse';
import IInventoryIngredient from '../../serverAPI/model/internal/ingredient/IInventoryIngredient';
import ImageSchema from '../../serverAPI/model/internal/image/ImageSchema';

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

let mockUpdatedUser = {
    firstName: "Alexander",
    lastName: "Plekunov",
    password: "pass",
    email: "email@test.com",
};

let mockInventoryIngredient: IInventoryIngredient;

beforeAll(async () => {
    mockInventoryIngredient = {
        id: ingredientGetResponseDefault.id,
        category: ingredientGetResponseDefault.category,
        name: ingredientGetResponseDefault.name,
        expirationDate: Date.now(),
        image: new ImageSchema("google.com")
    };

    await UserDatabase.getInstance()?.Create(mockVerifiedUser);
});

describe(`Inventory`, () => {
    it('Add responses', async () => {
        let response = await supertest(app)
            .post('/user/inventory')
            .send(mockInventoryIngredient);
        
        expect(response.statusCode).toBe(ResponseCodes.CREATED);
    });

    describe('GetAll responses', () => {
        it('Get inventory items', async () => {
            let response = await supertest(app)
                .get(`/user/inventory`);

            expect(response.statusCode).toBe(ResponseCodes.OK);
        });
    });

    describe('Get responses', () => {
        it('Get inventory item', async () => {
            let response = await supertest(app)
                .get(`/user/inventory/${mockInventoryIngredient.id}`);
            
            expect(response.statusCode).toBe(ResponseCodes.OK);
        });
    });

    describe('Update responses', () => {
        it('Update inventory item', async () => {
            let response = await supertest(app)
                .put(`/user/inventory/${mockInventoryIngredient.id}`)
                .send({
                    expirationDate: 123321123
                });

            expect(response.statusCode).toBe(ResponseCodes.OK);
        });
    });

    describe('Delete responses', () => {
        it('Delete inventory item', async () => {
            let response = await supertest(app)
                .delete(`/user/inventory/${mockInventoryIngredient.id}`);
            
            expect(response.statusCode).toBe(ResponseCodes.OK);
        });
    });
});

afterAll(async () => {
    UserDatabase.getInstance()?.disconnect();
});
