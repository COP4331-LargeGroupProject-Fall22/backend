import * as dotenv from 'dotenv';
dotenv.config();

import { IUser } from "../api/model/user/IUser";
import { UserDatabase } from "../database/MongoDB";

describe('User database functionality', () => {
    let userDB: UserDatabase

    let databaseURL = process.env.DB_CONNECTION_STRING_TESTING;
    let databaseName = process.env.DB_NAME;
    let collectionName = process.env.DB_USERS_COLLECTION;
    
    let uid: string | undefined;
    let _id: string | undefined;

    let mockUser: IUser;
    let mockUserSummary: Partial<IUser>;
    let mockUserUpdated: IUser;

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
            lastSeen: 12345213567
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
            lastSeen: 123454093567
        }
    });

    afterAll(async () => {
        await userDB.disconnect();
    });

    describe('create', () => {
        it('create user ', async () => {

            let actual: any = await userDB.CreateUser(mockUser);
            uid = actual?.uid;
            _id = actual?._id;

            expect(actual).toMatchObject(mockUser);
        });
    });

    describe('get', () => {
        it ('get users summary', async () => {
            let actual = await userDB.GetUsers();

            expect(actual).toMatchObject([mockUserSummary]);
        });

        it('get user by uid', async () => {
            expect(uid).not.toBeUndefined();

            let actual = await userDB.GetUser(new Map<String, any>([
                ["uid", uid]
            ]));

            expect(actual).toMatchObject(mockUser);
        });

        it ('get user by _id', async () => {
            expect(_id).not.toBeUndefined();

            let actual = await userDB.GetUser(new Map<String, any>([
                ["_id", _id]
            ]));

            expect(actual).toMatchObject(mockUser);
        });
    });

    describe('update', () => {
        it ('update user info by _id', async () => {
           expect(_id).not.toBeUndefined();
           
           let actual = await userDB.UpdateUser(_id!, mockUserUpdated);

           expect(actual).toMatchObject(mockUserUpdated);
        });
    });

    describe('delete', () => {
        it ('delete user by _id', async () => {
            expect(_id).not.toBeUndefined();

            let actual = await userDB.DeleteUser(_id!);

            expect(actual).toBeTruthy();
        });
    });
});
