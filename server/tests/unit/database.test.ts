import * as dotenv from 'dotenv';
dotenv.config();

import UserDatabase from "../../database/UserDatabase";
import IBaseUser from '../../serverAPI/model/user/IBaseUser';
import IUser from '../../serverAPI/model/user/IUser';

describe('User database functionality', () => {
    let userDB: UserDatabase
    
    let databaseURL = (global as any).__MONGO_URI__;
    let databaseName = process.env.DB_NAME!;
    let collectionName = process.env.DB_USERS_COLLECTION!;
    
    let mockUser: IUser = {
        inventory: [{
            expirationDate: 1231123,
            name: "Test",
            id: 234,
            category: "testCategory",
            nutrients: [
                {
                    name: "nutrientA",
                    unit: {
                        unit: "g",
                        value: 10
                    },
                    percentOfDaily: 10.4
                }
            ]
        }],
        firstName: 'Mikhail',
        lastName: 'Plekunov',
        lastSeen: Date.now(),
        password: '123',
        username: 'Mekromic'
    };

    let mockUpdatedUser: IUser = {
        firstName: "Alex",
        lastName: "The Great",
        lastSeen: 123454093567,
        inventory: [{
            expirationDate: 1231123,
            name: "Test",
            id: 234,
            category: "testCategory",
            nutrients: [
                {
                    name: "nutrientB",
                    unit: {
                        unit: "g",
                        value: 10
                    },
                    percentOfDaily: 10.4
                }
            ]
        }],
        password: 'Mekromic',
        username: 'password'
    };

    let mockUserSummary: IBaseUser;

    beforeAll(async () => {
        userDB = UserDatabase.connect(
            databaseURL,
            databaseName,
            collectionName
        );

        mockUserSummary = {
            firstName: mockUser.firstName,
            lastName: mockUser.lastName,
            lastSeen: mockUser.lastSeen
        };
    });

    afterAll(async () => {
        await userDB.disconnect();
    });

    describe('create', () => {
        it('create user ', async () => {
            let actual = await userDB.Create(mockUser);
            
            expect(actual).toMatchObject(mockUser);
        });
    });

    describe('get', () => {
        it ('get users summary', async () => {
            let actual = await userDB.GetAll();
            
            expect(actual).toMatchObject([mockUserSummary]);
        });

        it('get user by username', async () => {

            let actual = await userDB.Get(new Map<String, any>([
                ["username", mockUser.username]
            ]));

            expect(actual).toMatchObject(mockUser);
        });
    });

    describe('update', () => {
        it ('update user info by username', async () => {           
           let actual = await userDB.Update(mockUser.username, mockUpdatedUser);

           expect(actual).toMatchObject(mockUpdatedUser);
        });
    });

    describe('delete', () => {
        it ('delete user by username', async () => {
            let actual = await userDB.Delete(mockUpdatedUser.username);

            expect(actual).toBeTruthy();
        });
    });
});
