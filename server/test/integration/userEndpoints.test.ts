import * as dotenv from 'dotenv';
dotenv.config();

import { UserDatabase } from '../../database/UserDatabase';
import { NextFunction, Request, Response } from 'express';
import supertest from 'supertest';

jest.mock('../../authentication/Authenticator', () => {
    return function () {
        return {
            authenticate: (req: Request, res: Response, next: NextFunction) => { next(); }
        };
    }
});

jest.mock('../../logger/Logger', () => {
    return {
        consoleLog: (req: Request, res: Response, next: NextFunction) => { next(); }
    };
});

let databaseURL = (global as any).__MONGO_URI__;
let databaseName = process.env.DB_NAME;
let collectionName = process.env.DB_USERS_COLLECTION;

UserDatabase.connect(databaseURL, databaseName, collectionName);

import { app } from '../../App';
import { IUser } from '../../serverAPI/model/user/IUser';

describe('User endpoints', () => {
    let mockUser: IUser;
    let mockUserUpdated: Partial<IUser>;

    let mockID: string;

    beforeAll(() => {
        mockUser = {
            firstName: "Mikhail",
            lastName: "Plekunov",
            uid: "123op02osiao30kn1",
            lastSeen: 12345213567
        };

        mockUserUpdated = {
            firstName: "Alex",
            lastName: "The Great",
            uid: "123lk02psiao30412",
        }

        mockID = '634de9e4938f784f15998696';
    });

    describe('Get Requests', () => {
        it('Get Users is empty', async () => {
            let response = await supertest(app).get("/api/users");

            expect(response.statusCode).toBe(200);
            expect(response.body.data).toHaveLength(0);
        });

        it('Get User without id', async () => {
            let response = await supertest(app).get("/api/user/");

            expect(response.statusCode).toBe(404);
        });

        it('Get User with unsupported id', async () => {
            let response = await supertest(app).get("/api/user/asda123");

            expect(response.statusCode).toBe(400);
        });

        it(`Get User with supported id (user exist)`, async () => {
            let expected = await UserDatabase.getInstance()?.CreateUser(mockUser);

            let response = await supertest(app).get(`/api/user/${(expected as any)._id}`);

            expect(response.statusCode).toBe(200);
            expect(response.body.data).toMatchObject(mockUser);
        });

        it(`Get User with supported id (user doesn't exist)`, async () => {
            let response = await supertest(app).get(`/api/user/${mockID}`);

            expect(response.statusCode).toBe(404);
            expect(response.body.data).toBeNull();
        });

        it('Get Users is not empty', async () => {
            let response = await supertest(app).get("/api/users");

            expect(response.statusCode).toBe(200);
            expect(response.body.data).toHaveLength(1);
            expect(mockUser).toMatchObject(response.body.data[0]);
        });
    });

    describe('Update Requests', () => {
        it('Update User without id', async () => {
            let response = await supertest(app).get("/api/user/");

            expect(response.statusCode).toBe(404);
        });

        it('Update User with unsupported id', async () => {
            let response = await supertest(app).get("/api/user/1231asd");

            expect(response.statusCode).toBe(400);
        });

        it('Update User with supported id (user exists)', async () => {
            let response = await supertest(app)
                .put(`/api/user/${(mockUser as any)._id}`)
                .send(`firstName=${mockUserUpdated.firstName}`)
                .send(`lastName=${mockUserUpdated.lastName}`)
                .send(`uid=${mockUserUpdated.uid}`);

            expect(response.statusCode).toBe(200);
            expect(response.body.data).toMatchObject<Partial<IUser>>(mockUserUpdated);
        });

        it(`Update User with supported id (user doesn't exist)`, async () => {
            let response = await supertest(app)
                .put(`/api/user/${mockID}`)
                .send(`firstName=${mockUserUpdated.firstName}`)
                .send(`lastName=${mockUserUpdated.lastName}`)
                .send(`uid=${mockUserUpdated.uid}`);

            expect(response.statusCode).toBe(404);
            expect(response.body.data).toBeNull();
        });
    });

    describe('Delete Requests', () => {
        it ('Delete User without id', async () => {
            let response = await supertest(app)
                .delete(`/api/user/`);

            expect(response.statusCode).toBe(404);
        });

        it ('Delete User with unsupported id', async () => {
            let response = await supertest(app)
                .delete(`/api/user/123asd`);

            expect(response.statusCode).toBe(400);
        });

        it ('Delete User with supported id (user exists)', async () => {
            let response = await supertest(app)
                .delete(`/api/user/${(mockUser as any)._id}`);

            expect(response.statusCode).toBe(200);
        });

        it (`Delete User with supported id (user doesn't exists)`, async () => {
            let response = await supertest(app)
                .delete(`/api/user/${mockID}`);

            expect(response.statusCode).toBe(404);
        });
    });
});

afterAll(async () => {
    UserDatabase.getInstance()?.disconnect();
});
