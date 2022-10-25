import * as dotenv from 'dotenv';
dotenv.config();

import UserDatabase from '../../database/UserDatabase';
import { NextFunction, Request, Response } from 'express';
import supertest from 'supertest';
import IUser from '../../serverAPI/model/user/IUser';

let mockUser: Partial<IUser> = {
    firstName: "Mikhail",
    lastName: "Plekunov",
    uid: "123op02osiao30kn1",
};

jest.mock('../../serverAPI/middleware/authentication/Authenticator', () => {
    return function () {
        return {
            authenticate: (req: Request, res: Response, next: NextFunction) => {
                if (req.headers.authorization && req.headers.authorization.length > 0) {
                    (req as any).uid = mockUser.uid;
                    next();
                }
                else {
                    res.status(401).send();
                }
            }
        }
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

import { app } from '../../App';

describe('Authentication endpoints', () => {
    describe('Post Requests', () => {
        it('Register with incorrect field formats', async () => {
            let response = await supertest(app)
                .post('/auth/register')
                .set('Authorization', 'accessToken')
                .send(`firstName=`)
                .send(`lastName=`);

            expect(response.statusCode).toBe(400);
        });

        it('Register with correct authorization token', async () => {
            let response = await supertest(app)
                .post('/auth/register')
                .set('Authorization', 'accessToken')
                .send(`firstName=${mockUser.firstName}`)
                .send(`lastName=${mockUser.lastName}`);

            let expected = await UserDatabase.getInstance()?.GetUser(new Map<string, any>([
                ["uid", mockUser.uid]
            ]));

            expect(response.statusCode).toBe(200);
            expect(expected).toMatchObject(mockUser);

            mockUser = expected as IUser;
        });

        it(`Register with already existing UID`, async () => {
            let response = await supertest(app)
                .post('/auth/register')
                .set('Authorization', 'accessToken')
                .send(`firstName=${mockUser.firstName}`)
                .send(`lastName=${mockUser.lastName}`);

            expect(response.statusCode).toBe(400);
        });
    });

    describe('Get Requests', () => {
        it('Login without UID', async () => {
            let response = await supertest(app)
                .get('/auth/login')
                .set('Authorization', 'accessToken');

            expect(response.statusCode).toBe(200);
        });
    });
});

afterAll(async () => {
    UserDatabase.getInstance()?.disconnect();
});
