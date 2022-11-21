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
     * @returns Promise filled with IBaseUser or null if users weren't found.
     */
    async GetAll(parameters?: Map<String, any>): Promise<IUser[] | null> {
        return this.collection.find().toArray().then(users => {
            if (users.length === 0) {
                return Promise.resolve(null);
            }

            return Promise.resolve(users);
        }, () => Promise.resolve(null));
    }

    /**
    * Attempts to convert id to ObjectID.
    * 
    * @param id unique identifier of the user that is used internally in the database.
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
     *  One of two parameters required. If both provided, the result will have to satisfy both parameters
     * - _id - required parameter that defines user's _id.
     * - username - required parameter that defines unique user's username.
     * @throws NoParameterFound exception when required parameters weren't found.
     * @throws EmptyID exception when id is empty.
     * @throws IncorrectIDFormat exception when id has incorrect format.
     * @returns Promise filled with IUser object or null if user wasn't found.
     */
    async Get(parameters: Map<String, any>): Promise<IUser | null> {
        let filter: Filter<any> = Object.fromEntries(parameters);

        if (filter._id !== undefined) {
            filter._id = this.convertToObjectID(filter._id);
        }

        return this.collection.findOne(filter).then(user => {
            if (user === null) {
                return Promise.resolve(null);
            }

            return Promise.resolve(user);
        }, () => Promise.resolve(null));
    }

    /**
     * Retrieves complete information about specific user defined by only user's _id.
     * 
     * @param id unique identifier of the user that is used internally in the database.
     * 
     * @returns Promise filled with IUser object or null if user wasn't found.
     */
    private async GetUserByObjectId(id: ObjectId): Promise<IUser | null> {
        return this.collection.findOne({ "_id": id }).then(user => {
            if (user === null) {
                return Promise.resolve(null);
            }

            return Promise.resolve(user);
        }, () => Promise.resolve(null));
    }

    private async GetUserByUsername(username: string): Promise<IUser | null> {
        return this.collection.findOne({ "username": username }).then(user => {
            if (user === null) {
                return Promise.resolve(null);
            }

            return Promise.resolve(user);
        }, () => Promise.resolve(null));
    }

    /**
     * Creates user object in the database.
     * 
     * @param user IUser object filled with information about user.
     * @throws IncorrectSchema exception when IUser doesn't have correct format.
     * @returns Promise filled with IUser object or null if user wasn't created.
     */
    async Create(user: IUser): Promise<IUser | null> {
        return this.collection.insertOne(user).then(result => {
            return this.GetUserByObjectId(result.insertedId);
        }, () => Promise.resolve(null));
    }

    /**
     * Updates user object in the database.
     * 
     * @param id unique identifier of the user that is used internally in the database.
     * @param user IUser object filled with information about user.
     * @throws IncorrectSchema exception when IUser doesn't have correct format.
     * @throws EmptyID exception when id is empty.
     * @throws IncorrectIDFormat exception when id has incorrect format.
     * @returns Promise filled with updated IUser object or null if user wasn't updated.
     */
    async Update(username: string, user: IUser): Promise<IUser | null> {
        return this.GetUserByUsername(username).then(async () => {
            if (username !== user.username && await this.GetUserByUsername(user.username) !== null) {
                return Promise.resolve(null);
            }

            return this.collection.updateOne(
                { "username": username },
                {
                    $set:
                    {
                        "username": user.username,
                        "password": user.password,
                        "email": user.email,
                        "isVerified": user.isVerified,
                        "firstName": user.firstName,
                        "lastName": user.lastName,
                        "lastSeen": user.lastSeen,
                        "inventory": user.inventory,
                        "shoppingList": user.shoppingList,
                        "profilePicture": user.profilePicture,
                        "allergens": user.allergens,
                        "allergens": user.allergens,
                        "favoriteRecipes": user.favoriteRecipes
                    }
                }
            ).then(() => this.GetUserByUsername(user.username), () => Promise.resolve(null));
        }, () => Promise.resolve(null));
    }

    /**
     * Deletes user object from database.
     * 
     * @param id unique identifier of the user that is used internally in the database.
     * @throws EmptyID exception when id is empty.
     * @throws IncorrectIDFormat exception when id has incorrect format.
     * @returns Promise filled with boolean value indication status of the operation.
     */
    async Delete(username: string): Promise<boolean> {
        return this.GetUserByUsername(username).then(() => {
            return this.collection.deleteOne({ "username": username }).then(result => {
                return Promise.resolve(result.deletedCount === 1);
            });
        }, () => Promise.resolve(false));
    }
}
