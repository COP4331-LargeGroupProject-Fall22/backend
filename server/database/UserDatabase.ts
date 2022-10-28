import * as dotenv from 'dotenv';
dotenv.config();

import { MongoClient, Collection, Db, ObjectId, Filter, WithId } from 'mongodb';
import { exit } from 'process';
import EmptyID from '../exceptions/EmptyID';
import IncorrectIDFormat from '../exceptions/IncorrectIDFormat';
import IInternalUser from '../serverAPI/model/user/IInternalUser';

import IDatabase from './IDatabase';

/**
 * UserDatabase is responsible for providing an interface for the end-user filled with methods which allows
 * CRUD operations on the User collection.
 * 
 * It also uses Singleton design pattern. As such, there is only one database instance that will be created through out
 * execution lifetime.
 */
export default class UserDatabase implements IDatabase<IInternalUser> {
    private static instance?: UserDatabase;

    protected client!: MongoClient;

    protected database!: Db;
    protected collection!: Collection<IInternalUser>;

    private constructor(
        mongoURL: string,
        databaseName: string,
        collectionName: string,
    ) {
        try {
            this.client = new MongoClient(mongoURL);

            this.database = this.client.db(databaseName);
            this.collection = this.database.collection<IInternalUser>(collectionName);

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
     * Connects to the database if database instance doesn't exist
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
    async GetAll(parameters?: Map<String, any>): Promise<IInternalUser[] | null> {
        const users = this.collection.find();

        let userArr = await users.toArray();

        if (userArr.length == 0) {
            return new Promise(resolve => resolve(null));
        }

        let sensitiveUsers: IInternalUser[] = [];
        userArr.forEach(user => sensitiveUsers.push(this.convertToSensitiveUser(user)));

        return userArr;
    }

    private convertToSensitiveUser(user: WithId<IInternalUser>): IInternalUser {
        return {
            username: user.username,
            password: user.password,
            id: user._id.toString(),
            firstName: user.firstName,
            lastName: user.lastName,
            inventory: user.inventory,
            lastSeen: user.lastSeen
        };
    }

    /**
    * Attempts to convert id to ObjectID.
    * 
    * @param id unique identifier of the user that is used internally in the database.
    * 
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
        }
        catch (e) {
            throw new IncorrectIDFormat("_id should have a correct format. It can be a 24 character hex string, 12 byte binary Buffer, or a number.");
        }
    }

    /**
     * Retrieves complete information about specific user defined by user's _id.
     * 
     * @param parameters query parameters used for searching.
     * - _id - required parameter that defines user's _id.
     * 
     * @throws NoParameterFound exception when required parameters weren't found.
     * @throws EmptyID exception when id is empty.
     * @throws IncorrectIDFormat exception when id has incorrect format.
     * @returns Promise filled with ISensitiveUser object or null if user wasn't found.
     */
    async Get(parameters: Map<String, any>): Promise<IInternalUser | null> {
        let filter: Filter<any> = Object.fromEntries(parameters);

        if (filter._id !== undefined) {
            filter._id = this.convertToObjectID(filter._id);
        }

        let user = await this.collection.findOne(filter);

        if (user === null) {
            return Promise.resolve(null);
        }

        return this.convertToSensitiveUser(user);
    }

    /**
     * Retrieves complete information about specific user defined by only user's _id.
     * 
     * @param id unique identifier of the user that is used internally in the database.
     * 
     * @returns Promise filled with ISensitiveUser object or null if user wasn't found.
     */
    private async GetUserByObjectId(id: ObjectId): Promise<IInternalUser | null> {
        const user = await this.collection.findOne(
            { "_id": id }
        );

        if (user === null) {
            return Promise.resolve(null);
        }

        return this.convertToSensitiveUser(user);
    }

    /**
     * Creates user object in the database.
     * 
     * @param user IUser object filled with information about user.
     * 
     * @throws IncorrectSchema exception when ISensitiveUser doesn't have correct format.
     * @returns Promise filled with ISensitiveUser object or null if user wasn't created.
     */
    async Create(user: IInternalUser): Promise<IInternalUser | null> {
        console.log(user);

        let insertResult = await this.collection.insertOne({
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
     * Updates user object in the database
     * 
     * @param id unique identifier of the user that is used internally in the database.
     * @param user IUser object filled with information about user.
     * 
     * @throws IncorrectSchema exception when ISensitiveUser doesn't have correct format.
     * @throws EmptyID exception when id is empty.
     * @throws IncorrectIDFormat exception when id has incorrect format.
     * @returns Promise filled with updated ISensitiveUser object or null if user wasn't updated.
     */
    async Update(id: string, user: IInternalUser): Promise<IInternalUser | null> {
        let objectID = this.convertToObjectID(id);

        let existingUser = await this.GetUserByObjectId(objectID);

        if (existingUser === null) {
            return new Promise(resolve => resolve(null));
        }

        await this.collection.updateOne(
            { "_id": objectID },
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

        return this.GetUserByObjectId(objectID);
    }

    /**
     * Deletes user object from database.
     * 
     * @param id unique identifier of the user that is used internally in the database.
     * 
     * @throws EmptyID exception when id is empty.
     * @throws IncorrectIDFormat exception when id has incorrect format.
     * @returns Promise filled with boolean value indication status of the operation.
     */
    async Delete(id: string): Promise<boolean> {
        let objectID = this.convertToObjectID(id);

        let existingUser = await this.GetUserByObjectId(objectID);

        if (existingUser === null) {
            return new Promise(resolve => resolve(false));
        }

        let deleteResult = await this.collection.deleteOne(
            { "_id": objectID }
        );

        return new Promise(resolve => resolve(deleteResult.deletedCount === 1));
    }
}
