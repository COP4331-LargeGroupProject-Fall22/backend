import * as dotenv from 'dotenv';
dotenv.config();

import { UserDatabase } from '../../database/UserDatabase';
import { NextFunction, Request, Response } from 'express';
import supertest from 'supertest';

jest.mock('../../serverAPI/middleware/authentication/Authenticator', () => {
    return function () {
        return {
            authenticate: (req: Request, res: Response, next: NextFunction) => { next(); }
        };
    }
});

jest.mock('../../serverAPI/middleware/logger/Logger', () => {
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
import IFoodItem from '../../serverAPI/model/food/IFoodItem';

describe('User endpoints', () => {
    let mockUser: IUser;
    let mockUserUpdated: Partial<IUser>;

    let mockFood: IFoodItem;
    let mockFoodUpdated: IFoodItem;

    let mockFoodID: number;
    let mockID: string;

    beforeAll(() => {
        mockFoodID = 123321;
        mockID = '634de9e4938f784f15998696';

        mockFood = {
            expirationDate: 99999,
            id: mockFoodID,
            name: "FoodItemA",
            category: "CatA",
            nutrients: [
                {
                    name: "nutrientC",
                    unit: {
                        unit: "g",
                        value: 20
                    },
                    percentOfDaily: 10.4
                }
            ]
        };

        mockFoodUpdated = {
            expirationDate: 77777,
            id: mockFoodID,
            name: "FoodItemB",
            category: "CatB",
            nutrients: [
                {
                    name: "nutrientA",
                    unit: {
                        unit: "grams",
                        value: 123
                    },
                    percentOfDaily: 12.4
                }
            ]
        }

        mockUser = {
            firstName: "Mikhail",
            lastName: "Plekunov",
            uid: "123op02osiao30kn1",
            lastSeen: 12345213567,
            inventory: []
        };

        mockUserUpdated = {
            firstName: "Alex",
            lastName: "The Great",
            uid: "123lk02psiao30412"
        };
    });

    describe('Get User Requests', () => {
        it('Get Users is empty', async () => {
            let response = await supertest(app).get("/users");

            expect(response.statusCode).toBe(200);
            expect(response.body.data).toStrictEqual([]);
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
            let expected = await UserDatabase.getInstance()?.CreateUser(mockUser);
            mockUser = expected!;

            let response = await supertest(app).get(`/users/user/${(mockUser as any)._id}`);

            expect(response.statusCode).toBe(200);
            expect(response.body.data).toMatchObject(mockUser);
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
            expect(mockUser).toMatchObject(response.body.data[0]);
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
                .put(`/users/user/${(mockUser as any)._id}`)
                .send(`firstName=${mockUserUpdated.firstName}`)
                .send(`lastName=${mockUserUpdated.lastName}`)
                .send(`uid=${mockUserUpdated.uid}`);

            expect(response.statusCode).toBe(200);
            expect(response.body.data).toMatchObject<Partial<IUser>>(mockUserUpdated);
        });

        it(`Update User with supported id (user doesn't exist)`, async () => {
            let response = await supertest(app)
                .put(`/users/user/${mockID}`)
                .send(`firstName=${mockUserUpdated.firstName}`)
                .send(`lastName=${mockUserUpdated.lastName}`)
                .send(`uid=${mockUserUpdated.uid}`);

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
                .delete(`/users/user/${(mockUser as any)._id}`);

            expect(response.statusCode).toBe(200);
        });

        it(`Delete User with supported id (user doesn't exists)`, async () => {
            let response = await supertest(app)
                .delete(`/users/user/${mockID}`);

            expect(response.statusCode).toBe(404);
        });
    });

    describe('Create Food Requests', () => {
        it(`Create Food Item in user's inventory`, async () => {
            let expected = await UserDatabase.getInstance()?.CreateUser(mockUser);
            mockUser = expected!;

            let response = await supertest(app)
                .post(`/users/user/${(mockUser as any)._id}/foods/food`)
                .send(`name=${mockFood.name}`)
                .send(`category=${mockFood.category}`)
                .send(`nutrients=${JSON.stringify(mockFood.nutrients)}`)
                .send(`expirationDate=${mockFood.expirationDate}`)
                .send(`id=${mockFood.id}`);

            expect(response.statusCode).toBe(200);
            expect(response.body.data).toMatchObject([mockFood]);
        });
    });

    describe('Get Food Requests', () => {
        it(`Get Food Item from user's inventory`, async () => {
            let response = await supertest(app)
                .get(`/users/user/${(mockUser as any)._id}/foods/food/${mockFoodID}`);
            
            expect(response.statusCode).toBe(200);
            expect(response.body.data).toMatchObject(mockFood);
        });

        it(`Get Food inventory`, async () => {
            let response = await supertest(app)
                .get(`/users/user/${(mockUser as any)._id}/foods`);

            expect(response.statusCode).toBe(200);
            expect(response.body.data).toMatchObject([mockFood]);
        });
    });

    describe(`Update Food Requests`, () => {
        it(`Update Food Item from user's inventory`, async () => {
            let response = await supertest(app)
                .put(`/users/user/${(mockUser as any)._id}/foods/food/${mockFoodID}`)
                .send(`id=${mockFoodUpdated.id}`)
                .send(`name=${mockFoodUpdated.name}`)
                .send(`category=${mockFoodUpdated.category}`)
                .send(`nutrients=${JSON.stringify(mockFoodUpdated.nutrients)}`)
                .send(`expirationDate=${mockFoodUpdated.expirationDate}`);
                
            expect(response.statusCode).toBe(200);
            expect(response.body.data).toMatchObject([mockFoodUpdated]);
        });
    });

    describe(`Delete Food Requests`, () => {
        it(`Delete Food Item from user's inventory`, async () => {
            let response = await supertest(app)
                .delete(`/users/user/${(mockUser as any)._id}/foods/food/${mockFoodID}`);

            expect(response.statusCode).toBe(200);
            expect(response.body.data).toStrictEqual([]);
        });
    });
});

afterAll(async () => {
    UserDatabase.getInstance()?.disconnect();
});
