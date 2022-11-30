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

import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

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

import { profileImage } from './responses/image/profileImage';

let mockAxios = new MockAdapter(axios);

let postUrl: string;

let mockAddProfileImageRequest: any;

beforeAll(async () => {
    mockAddProfileImageRequest = {
        imgAsBase64: profileImage
    };

    postUrl = process.env.FREE_IMAGE_HOST_BASE_URL!;

    await UserDatabase.getInstance()?.Create(mockVerifiedUser);
});

describe(`Profile Picture`, () => {
    describe('Add profile picture', () => {
        it('Add responses', async () => {
            mockAxios.onPost(postUrl).reply(ResponseCodes.OK,
                {
                    image: {
                        file: {
                            resource: {
                                chain: {
                                    image: 'google.com'
                                }
                            }
                        }
                    }
                }
            );

            let response = await supertest(app)
                .post('/user/profile-picture')
                .send(mockAddProfileImageRequest);

            expect(response.statusCode).toBe(ResponseCodes.CREATED);
        });
    });

    describe('Get responses', () => {
        it('Get profile picture', async () => {
            let response = await supertest(app)
                .get(`/user/profile-picture`);

            expect(response.statusCode).toBe(ResponseCodes.OK);
        });
    });

    describe('Delete responses', () => {
        it('Delete profile picture', async () => {
            let response = await supertest(app)
                .delete(`/user/profile-picture`);

            expect(response.statusCode).toBe(ResponseCodes.OK);
        });
    });
});

afterAll(async () => {
    UserDatabase.getInstance()?.disconnect();
});
