import * as dotenv from 'dotenv';
dotenv.config();

import { NextFunction, Request, Response } from 'express';
import supertest from 'supertest';

import IUser from '../../serverAPI/model/user/IUser';

import UserSchema from '../../serverAPI/model/user/UserSchema';
import UserRegistrationSchema from '../../serverAPI/model/user/requestSchema/UserRegistrationSchema';
import UserLoginSchema from '../../serverAPI/model/user/requestSchema/UserLoginSchema';

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

let mockRegisterUser: IUser;
let mockRegisterUserIncorrectSchema: UserRegistrationSchema;
let mockRegisterUserAlreadyExists: UserRegistrationSchema;

let mockLoginUser: UserLoginSchema;
let mockLoginUserIncorrectCredentials: UserLoginSchema;
let mockLoginUserIncorrectSchema: UserLoginSchema;

let mockVerifiedUser: UserSchema;

beforeAll(() => {
    mockRegisterUser = new UserSchema(
        "Mikhail",
        "Plekunov",
        "Mekromic",
        "password",
        "test@gmail.com",
        Date.now()
    );

    mockRegisterUserIncorrectSchema = new UserRegistrationSchema(
        "",
        "",
        "",
        "",
        ""
    );

    mockRegisterUserAlreadyExists = new UserRegistrationSchema(
        "Mikhaik",
        "Plekunov",
        "Mekromic",
        "password",
        "email"
    );

    mockLoginUser = new UserLoginSchema("Mekromic", "password");

    mockLoginUserIncorrectCredentials = new UserLoginSchema("Mekromic", "pass");

    mockLoginUserIncorrectSchema = new UserLoginSchema("", "");

    mockVerifiedUser = new UserSchema(
        mockRegisterUser.firstName,
        mockRegisterUser.lastName,
        mockRegisterUser.username,
        mockRegisterUser.password,
        mockRegisterUser.email,
        mockRegisterUser.lastSeen
    );

    mockVerifiedUser.isVerified = true;
});

describe('Authentication', () => {
    describe('Register responses', () => {
        it('Register with incorrect schema', async () => {
            let response = await supertest(app)
                .post('/auth/register')
                .send(mockRegisterUserIncorrectSchema);

            expect(response.statusCode).toBe(ResponseCodes.BAD_REQUEST);
        });

        it('Register with correct schema', async () => {
            let response = await supertest(app)
                .post('/auth/register')
                .send(mockRegisterUser);

            expect(response.statusCode).toBe(ResponseCodes.OK);
        });

        it(`Register with already existing username`, async () => {
            let response = await supertest(app)
                .post('/auth/register')
                .send(mockRegisterUserAlreadyExists);

            expect(response.statusCode).toBe(ResponseCodes.BAD_REQUEST);
        });
    });

    describe('Login responses', () => {
        it('Login with incorrect credentials', async () => {
            let response = await supertest(app)
                .post('/auth/login')
                .send(mockLoginUserIncorrectCredentials);

            expect(response.statusCode).toBe(ResponseCodes.UNAUTHORIZED);
        });

        it('Login with incorrect schema', async () => {
            let response = await supertest(app)
                .post('/auth/login')
                .send(mockLoginUserIncorrectSchema);

            expect(response.statusCode).toBe(ResponseCodes.BAD_REQUEST);
        });

        it('Login with correct credentials (unverified account)', async () => {
            let response = await supertest(app)
                .post('/auth/login')
                .send(mockLoginUser);

            expect(response.statusCode).toBe(ResponseCodes.FORBIDDEN);
        });

        it('Login with correct credentials (verified account)', async () => {
            let user = await UserDatabase.getInstance()?.Get(new Map([["username", mockLoginUser.username]]));

            let userSchema = new UserSchema(
                user?.firstName!,
                user?.lastName!,
                user?.username!,
                user?.password!,
                user?.email!,
                user?.lastSeen!
            );

            userSchema.isVerified = true;

            await UserDatabase.getInstance()?.Update(
                mockLoginUser.username,
                userSchema
            );

            let response = await supertest(app)
                .post('/auth/login')
                .send(mockLoginUser);

            expect(response.statusCode).toBe(ResponseCodes.OK);
        });
    });

    describe('RefreshJWT Responses', () => {
        it('Refresh JWT with correct refresh token', async () => {
            let response = await supertest(app)
                .post('/auth/login')
                .send(mockLoginUser);

            let accessToken = response.body.accessToken;
            let refreshToken = response.body.refreshToken;

            await new Promise((r) => setTimeout(r, 1000));

            response = await supertest(app)
                .post('/auth/refreshJWT')
                .send({ refreshToken: refreshToken });

            expect(response.body.refreshToken).not.toBe(refreshToken);
            expect(response.body.accessToken).not.toBe(accessToken);
            expect(response.statusCode).toBe(ResponseCodes.OK);
        });

        it('Refresh JWT with incorrect refresh token', async () => {
            let response = await supertest(app)
                .post('/auth/refreshJWT')
                .send({ refreshToken: "" });

            expect(response.statusCode).toBe(ResponseCodes.UNAUTHORIZED);
        });
    });

    describe('Logout Responses', () => {
        it('Logout works as expected', async () => {
            let response = await supertest(app)
                .post('/auth/login')
                .send(mockLoginUser);

            let accessToken = response.body.accessToken;

            response = await supertest(app)
                .get('/auth/logout')
                .set("Authorization", accessToken);

            expect(response.statusCode).toBe(ResponseCodes.OK);
        });
    });
});

afterAll(async () => {
    UserDatabase.getInstance()?.disconnect();
});
