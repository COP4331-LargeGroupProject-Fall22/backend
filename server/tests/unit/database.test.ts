import * as dotenv from 'dotenv';
dotenv.config();

import ISensitiveUser from "../../serverAPI/model/user/ISensitiveUser";
import UserDatabase from "../../database/UserDatabase";
import IBaseUser from '../../serverAPI/model/user/IBaseUser';
import IInternalUser from '../../serverAPI/model/user/IInternalUser';

describe('User database functionality', () => {
    let userDB: UserDatabase
    
    let databaseURL = (global as any).__MONGO_URI__;
    let databaseName = process.env.DB_NAME!;
    let collectionName = process.env.DB_USERS_COLLECTION!;
    
    let uid: string | undefined;
    let _id: string | undefined;

    let mockUser: IInternalUser;
    let mockUserSummary: IBaseUser;
    let mockUserUpdated: IInternalUser;

    beforeAll(async () => {
        userDB = UserDatabase.connect(
            databaseURL,
            databaseName,
            collectionName
        );
        
        mockUser = {
            firstName: "Mikhail",
            lastName: "Plekunov",
            uid: "123op02osiao30kn1",
            lastSeen: 12345213567,
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
            }]
        };

        mockUserSummary = {
            firstName: "Mikhail",
            lastName: "Plekunov",
            lastSeen: 12345213567
        };

        mockUserUpdated = {
            firstName: "Alex",
            lastName: "The Great",
            uid: "123lk02psiao30412",
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
            }]
        }
    });

    afterAll(async () => {
        await userDB.disconnect();
    });

    describe('create', () => {
        it('create user ', async () => {
            let actual = await userDB.Create(mockUser);
            uid = actual?.uid;
            _id = actual?.id;
            
            expect(actual).toMatchObject(mockUser);
        });
    });

    describe('get', () => {
        it ('get users summary', async () => {
            let actual = await userDB.GetAll();
            
            expect(actual).toMatchObject([mockUserSummary]);
        });

        it('get user by uid', async () => {
            expect(uid).not.toBeUndefined();

            let actual = await userDB.Get(new Map<String, any>([
                ["uid", uid]
            ]));

            expect(actual).toMatchObject(mockUser);
        });

        it ('get user by _id', async () => {
            expect(_id).not.toBeUndefined();

            let actual = await userDB.Get(new Map<String, any>([
                ["_id", _id]
            ]));

            expect(actual).toMatchObject(mockUser);
        });
    });

    describe('update', () => {
        it ('update user info by _id', async () => {
           expect(_id).not.toBeUndefined();
           
           let actual = await userDB.Update(_id!, mockUserUpdated);

           expect(actual).toMatchObject(mockUserUpdated);
        });
    });

    describe('delete', () => {
        it ('delete user by _id', async () => {
            expect(_id).not.toBeUndefined();

            let actual = await userDB.Delete(_id!);

            expect(actual).toBeTruthy();
        });
    });
});
