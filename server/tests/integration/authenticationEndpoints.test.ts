import * as dotenv from 'dotenv';
dotenv.config();

import UserDatabase from '../../database/UserDatabase';
import { NextFunction, Request, Response } from 'express';
import supertest from 'supertest';

let mockUser: IUser = {
    inventory: [],
    firstName: 'Mikhail',
    lastName: 'Plekunov',
    lastSeen: Date.now(),
    password: '123',
    username: 'Mekromic',
    shoppingCart: []
};

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
import IUser from '../../serverAPI/model/user/IUser';
import IIdentification from '../../serverAPI/model/user/IIdentification';

describe('Authentication endpoints', () => {
    describe('Post Requests', () => {
        it('Register with incorrect field formats', async () => {
            let response = await supertest(app)
                .post('/auth/register')
                .send({
                    firstName: "",
                    lastName: "",
                    username: "",
                    password: ""
                });

            expect(response.statusCode).toBe(400);
        });

        it('Register with correct information', async () => {
            let response = await supertest(app)
                .post('/auth/register')
                .send({
                    firstName: mockUser.firstName,
                    lastName: mockUser.lastName,
                    username: mockUser.username,
                    password: mockUser.password
                });

            expect(response.statusCode).toBe(200);
        });

        it(`Register with already existing username`, async () => {
            let response = await supertest(app)
                .post('/auth/register')
                .send({
                    firstName: mockUser.firstName,
                    lastName: mockUser.lastName,
                    username: mockUser.username,
                    password: mockUser.password
                });

            expect(response.statusCode).toBe(400);
        });
    });

    describe('Get Requests', () => {
        it('Login with correct credentials', async () => {
            let response = await supertest(app)
                .post('/auth/login')
                .send({
                    username: mockUser.username,
                    password: mockUser.password
                });

            expect(response.statusCode).toBe(200);
        });

        it('Login with incorrect credentials (username)', async () => {
            let response = await supertest(app)
                .post('/auth/login')
                .set('Authorization', 'accessToken')
                .send({
                    username: "pff",
                    password: mockUser.password
                });

            expect(response.statusCode).toBe(404);
        });

        it('Login with incorrect credentials (password)', async () => {
            let response = await supertest(app)
                .post('/auth/login')
                .set('Authorization', 'accessToken')
                .send({
                    username: mockUser.username,
                    password: "pff"
                });

            expect(response.statusCode).toBe(403);
        });


        it('Login with incorrect credentials (both)', async () => {
            let response = await supertest(app)
                .post('/auth/login')
                .set('Authorization', 'accessToken')
                .send({
                    username: "pff",
                    password: "pff"
                });

            expect(response.statusCode).toBe(404);
        });
    });
});

afterAll(async () => {
    UserDatabase.getInstance()?.disconnect();
});
