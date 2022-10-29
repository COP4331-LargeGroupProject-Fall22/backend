import * as dotenv from 'dotenv';
dotenv.config();

import { MongoClient, Collection, Db, ObjectId, Filter } from 'mongodb';
import { exit } from 'process';
import EmptyID from '../exceptions/EmptyID';
import IncorrectIDFormat from '../exceptions/IncorrectIDFormat';
import IUser from '../serverAPI/model/user/IUser';

import IDatabase from './IDatabase';

/**
 * UserDatabase is responsible for providing an interface for the end-user filled with methods which allows
 * CRUD operations on the User collection.
 * 
 * It also uses Singleton design pattern. As such, there is only one database instance that will be created through out
 * execution lifetime.
 */
export default class UserDatabase implements IDatabase<IUser> {
    private static instance?: UserDatabase;

    protected client!: MongoClient;

    protected database!: Db;
    protected collection!: Collection<IUser>;

    private constructor(
        mongoURL: string,
        databaseName: string,
        collectionName: string,
    ) {
        try {
            this.client = new MongoClient(mongoURL);

            this.database = this.client.db(databaseName);
            this.collection = this.database.collection<IUser>(collectionName);

            return this;
        } catch (e) {
            console.log(e);
            exit(1);
        }
    }

    /**
     * Retrieves current instance of the UserDatabase if such exists.
     * 
     * @returns UserDatabase object or undefined.
     */
    static getInstance(): UserDatabase | undefined {
        return UserDatabase.instance;
    }

    /**
     * Connects to the database if database instance doesn't exist.
     * 
     * @returns UserDatabase object.
     */
    static connect(
        mongoURL: string,
        name: string,
        collection: string,
    ): UserDatabase {
        if (UserDatabase.instance === undefined) {
            UserDatabase.instance = new UserDatabase(mongoURL, name, collection);
        }

        return UserDatabase.instance;
    }

    /**
     * Disconnects database from database provider.
     */
    async disconnect() {
        if (this.client) {
            await this.client.close();
            UserDatabase.instance = undefined;
        }
    }

    /**
     * Retrieves general information about all user objects stored in the database. 
     * 
     * @param parameters query parameters used for searching.
     * @returns Promise filled with IBaseUser or null if useres weren't found.
     */
    async GetAll(parameters?: Map<String, any>): Promise<IUser[] | null> {
        const users = this.collection.find();

        let userArr = await users.toArray();

        if (userArr.length == 0) {
            return Promise.resolve(null);
        }

        return userArr;
    }

    /**
    * Attempts to convert id to ObjectID.
    * 
<<<<<<< HEAD
    * @param id unique identifier of the user that is used internally in the database.
    * 
=======
    * @param id unique identifier of the user that is used internally in the MongoDB.
>>>>>>> add-client-server-interface-for-recipeAPI
    * @throws EmptyID exception when id is empty.
    * @throws IncorrectIDFormat exception when id has incorrect format.
    * @return ObjectID if conversion was successful.
    */
    private convertToObjectID(id: string): ObjectId {
        if (id.length === 0) {
            throw new EmptyID("_id cannot be empty string.");
        }

        try {
            return new ObjectId(id);
        } catch (e) {
            throw new IncorrectIDFormat(
                "_id should have a correct format. It can be a 24 character hex string, 12 byte binary Buffer, or a number.");
        }
    }

    /**
     * Retrieves complete information about specific user defined by user's _id.
     * 
     * @param parameters query parameters used for searching.
     * - _id - required parameter that defines user's _id.
     * @throws NoParameterFound exception when required parameters weren't found.
     * @throws EmptyID exception when id is empty.
     * @throws IncorrectIDFormat exception when id has incorrect format.
     * @returns Promise filled with ISensitiveUser object or null if user wasn't found.
     */
    async Get(parameters: Map<String, any>): Promise<IUser | null> {
        let filter: Filter<any> = Object.fromEntries(parameters);

        if (filter._id !== undefined) {
            filter._id = this.convertToObjectID(filter._id);
        }

        let user = await this.collection.findOne(filter);

        if (user === null) {
            return Promise.resolve(null);
        }

        return user;
    }

    /**
     * Retrieves complete information about specific user defined by only user's _id.
     * 
<<<<<<< HEAD
     * @param id unique identifier of the user that is used internally in the database.
     * 
     * @returns Promise filled with ISensitiveUser object or null if user wasn't found.
=======
     * @param id unique identifier of the user that is used internally in the MongoDB.
     * @returns Promise filled with IUser object or null if user wasn't found.
>>>>>>> add-client-server-interface-for-recipeAPI
     */
    private async GetUserByObjectId(id: ObjectId): Promise<IUser | null> {
        const user = await this.collection.findOne(
            { "_id": id }
        );

        if (user === null) {
            return Promise.resolve(null);
        }

        return user;
    }

    private async GetUserByUsername(username: string): Promise<IUser | null> {
        const user = await this.collection.findOne(
            { "username": username }
        );

        if (user === null) {
            return Promise.resolve(null);
        }

        return user;
    }

    /**
     * Creates user object in the database.
     * 
     * @param user IUser object filled with information about user.
<<<<<<< HEAD
     * 
     * @throws IncorrectSchema exception when ISensitiveUser doesn't have correct format.
     * @returns Promise filled with ISensitiveUser object or null if user wasn't created.
=======
     * @throws IncorrectSchema exception when IUser doesn't have correct format.
     * @returns Promise filled with IUser object or null if user wasn't created.
>>>>>>> add-client-server-interface-for-recipeAPI
     */
    async Create(user: IUser): Promise<IUser | null> {
        let insertResult = await this.collection
            .insertOne({
                firstName: user.firstName,
                lastName: user.lastName,
                username: user.username,
                password: user.password,
                inventory: user.inventory,
                lastSeen: user.lastSeen
            });

        return this.GetUserByObjectId(insertResult.insertedId);
    }

    /**
     * Updates user object in the database.
     * 
     * @param id unique identifier of the user that is used internally in the database.
     * @param user IUser object filled with information about user.
<<<<<<< HEAD
     * 
     * @throws IncorrectSchema exception when ISensitiveUser doesn't have correct format.
=======
     * @throws IncorrectSchema exception when IUser doesn't have correct format.
>>>>>>> add-client-server-interface-for-recipeAPI
     * @throws EmptyID exception when id is empty.
     * @throws IncorrectIDFormat exception when id has incorrect format.
     * @returns Promise filled with updated ISensitiveUser object or null if user wasn't updated.
     */
    async Update(username: string, user: IUser): Promise<IUser | null> {
        let existingUser = await this.GetUserByUsername(username);

        if (existingUser === null) {
            return Promise.resolve(null);
        }

        if (username !== user.username) {
            let potentialUser = await this.GetUserByUsername(user.username);

            if (potentialUser !== null) {
                return Promise.resolve(null);
            }
        }
        await this.collection.updateOne(
            { "username": username },
            {
                $set:
                {
                    "username": user.username,
                    "password": user.password,
                    "firstName": user.firstName,
                    "lastName": user.lastName,
                    "lastSeen": user.lastSeen,
                    "inventory": user.inventory
                }
            }
        );

        return this.GetUserByUsername(user.username);
    }

    /**
     * Deletes user object from database.
     * 
<<<<<<< HEAD
     * @param id unique identifier of the user that is used internally in the database.
     * 
=======
     * @param id unique identifier of the user that is used internally in the MongoDB.
>>>>>>> add-client-server-interface-for-recipeAPI
     * @throws EmptyID exception when id is empty.
     * @throws IncorrectIDFormat exception when id has incorrect format.
     * @returns Promise filled with boolean value indication status of the operation.
     */
    async Delete(username: string): Promise<boolean> {
        let existingUser = await this.GetUserByUsername(username);

        if (existingUser === null) {
            return new Promise(resolve => resolve(false));
        }

        let deleteResult = await this.collection.deleteOne(
            { "username": username }
        );

        return new Promise(resolve => resolve(deleteResult.deletedCount === 1));
    }
}
