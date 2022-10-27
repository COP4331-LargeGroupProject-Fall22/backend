import * as dotenv from 'dotenv';
dotenv.config();

import UserDatabase from '../../database/UserDatabase';
import { NextFunction, Request, Response } from 'express';
import supertest from 'supertest';
import ISensitiveUser from '../../serverAPI/model/user/ISensitiveUser';


let mockInternalUserUID = "123op02osiao30kn1";

jest.mock('../../serverAPI/middleware/authentication/Authenticator', () => {
    return function () {
        return {
            authenticate: (req: Request, res: Response, next: NextFunction) => { 
                (req as any).uid = mockInternalUserUID
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

import { app } from '../../App';
import IInternalUser from '../../serverAPI/model/user/IInternalUser';
import IBaseUser from '../../serverAPI/model/user/IBaseUser';

describe('User endpoints', () => {
    let mockInternalUser: IInternalUser;
    let mockSensitiveUser: ISensitiveUser;
    let mockBaseUser: IBaseUser;

    let mockSensitiveUserUpdated: ISensitiveUser;

    let mockID: string;

    beforeAll(() => {
        mockID = '634de9e4938f784f15998696';

        mockInternalUser = {
            firstName: "Mikhail",
            lastName: "Plekunov",
            uid: mockInternalUserUID,
            lastSeen: 12345213567,
            inventory: []
        };

        mockSensitiveUser = {
            firstName: "Mikhail",
            lastName: "Plekunov",
            lastSeen: 12345213567,
            inventory: []
        };
        
        mockBaseUser = {
            firstName: "Mikhail",
            lastName: "Plekunov",
            lastSeen: 12345213567
        };

        mockSensitiveUserUpdated = {
            firstName: "Alex",
            lastName: "The Great",
            lastSeen: 12345213567,
            inventory: []
        };
    });

    describe('Get User Requests', () => {
        it('Get Users is empty', async () => {
            let response = await supertest(app).get("/users");

            expect(response.statusCode).toBe(200);
            expect(response.body.data).toBeNull();
        });

        it('Get User without id', async () => {
            let response = await supertest(app).get("/users/user/");

            expect(response.statusCode).toBe(404);
        });

        it('Get User with unsupported id', async () => {
            let response = await supertest(app).get("/users/user/asda123");

            expect(response.statusCode).toBe(400);
        });

        it(`Get User with supported id (user exist)`, async () => {
            let expected = await UserDatabase.getInstance()?.Create(mockInternalUser);
            mockInternalUser = expected!;

            let response = await supertest(app).get(`/users/user/${mockInternalUser.id}`);

            expect(response.statusCode).toBe(200);
            expect(response.body.data).toMatchObject(mockSensitiveUser);
        });

        it(`Get User with supported id (user doesn't exist)`, async () => {
            let response = await supertest(app).get(`/users/user/${mockID}`);

            expect(response.statusCode).toBe(404);
            expect(response.body.data).toBe(undefined);
        });

        it('Get Users is not empty', async () => {
            let response = await supertest(app).get("/users");

            expect(response.statusCode).toBe(200);
            expect(response.body.data).toHaveLength(1);
            expect(response.body.data[0]).toMatchObject(mockBaseUser);
        });
    });

    describe('Update User Requests', () => {
        it('Update User without id', async () => {
            let response = await supertest(app).get("/users/user/");

            expect(response.statusCode).toBe(404);
        });

        it('Update User with unsupported id', async () => {
            let response = await supertest(app).get("/users/user/1231asd");

            expect(response.statusCode).toBe(400);
        });

        it('Update User with supported id (user exists)', async () => {
            let response = await supertest(app)
                .put(`/users/user/${mockInternalUser.id}`)
                .send(`firstName=${mockSensitiveUserUpdated.firstName}`)
                .send(`lastName=${mockSensitiveUserUpdated.lastName}`);

            expect(response.statusCode).toBe(200);
            expect(response.body.data).toMatchObject(mockSensitiveUserUpdated);
        });

        it(`Update User with supported id (user doesn't exist)`, async () => {
            let response = await supertest(app)
                .put(`/users/user/${mockID}`)
                .send(`firstName=${mockSensitiveUserUpdated.firstName}`)
                .send(`lastName=${mockSensitiveUserUpdated.lastName}`)

            expect(response.statusCode).toBe(404);
            expect(response.body.data).toBe(undefined);
        });
    });

    describe('Delete User Requests', () => {
        it('Delete User without id', async () => {
            let response = await supertest(app)
                .delete(`/users/user/`);

            expect(response.statusCode).toBe(404);
        });

        it('Delete User with unsupported id', async () => {
            let response = await supertest(app)
                .delete(`/users/user/123asd`);

            expect(response.statusCode).toBe(400);
        });

        it('Delete User with supported id (user exists)', async () => {
            let response = await supertest(app)
                .delete(`/users/user/${mockInternalUser.id}`);

            expect(response.statusCode).toBe(200);
        });

        it(`Delete User with supported id (user doesn't exists)`, async () => {
            let response = await supertest(app)
                .delete(`/users/user/${mockID}`);

            expect(response.statusCode).toBe(404);
        });
    });
});

afterAll(async () => {
    UserDatabase.getInstance()?.disconnect();
});
