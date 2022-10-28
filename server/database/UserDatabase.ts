import * as dotenv from 'dotenv';
dotenv.config();

import { MongoClient, Collection, Db, ObjectId, Filter } from 'mongodb';
import { exit } from 'process';
import EmptyID from '../exceptions/EmptyID';
import IncorrectIDFormat from '../exceptions/IncorrectIDFormat';
import IncorrectSchema from '../exceptions/IncorrectSchema';
import NoParameterFound from '../exceptions/NoParameterFound';

import IUser from '../serverAPI/model/user/IUser';
import UserSchema from '../serverAPI/model/user/UserSchema';
import { Validator } from '../utils/Validator';
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
    protected userCollection!: Collection<IUser>;

    private constructor(mongoURL: string, name: string, collection: string) {
        try {
            this.client = new MongoClient(mongoURL);

            this.database = this.client.db(name);
            this.userCollection = this.database.collection<IUser>(collection);

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
    static connect(mongoURL: string, name: string, collection: string): UserDatabase {
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
     * @returns Promise filled with Partial<IUser> where each IUser object will contain only general information or null if users weren't found.
     */
    async GetUsers(parameters?: Map<String, any>): Promise<Partial<IUser>[] | null> {
        const users = this.userCollection.find()
            .project({ firstName: 1, lastName: 1, lastSeen: 1, _id: 0 });

        let userArr = users.toArray();

        if ((await userArr).length == 0) {
            return new Promise(resolve => resolve(null));
        }

        return userArr;
    }

    /**
     * Attempts to convert IUser to UserSchema.
     * 
     * @param user IUser object
     * @throws IncorrectSchema exception when IUser doesn't have correct format.
     * @return UserScema if conversion was successful.
     */
    private async convertToUserSchema(user: IUser): Promise<UserSchema> {
        let definedUser = new UserSchema(
            user.firstName,
            user.lastName,
            user.uid
        );

        definedUser.inventory = user.inventory;
        definedUser.lastSeen = user.lastSeen;

        let logs = new Validator().validate(definedUser);

        if ((await logs).length > 0) {
            throw new IncorrectSchema(`User object doesn't have correct format.\n${logs}`);
        }

        return definedUser;
    }

    /**
    * Attempts to convert id to ObjectID.
    * 
    * @param id unique identifier of the user that is used internally in the MongoDB.
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
            throw new IncorrectIDFormat("_id should have a correct format. It can be a 24 character hex string, 12 byte binary Buffer, or a number.");
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
     * @returns Promise filled with IUser object or null if user wasn't found.
     */
    async GetUser(parameters: Map<String, any>): Promise<IUser | null> {
        let filter: Filter<any> = Object.fromEntries(parameters);

        if (filter._id === undefined && filter.uid === undefined) {
            throw new NoParameterFound("Need to provide either _id or uid");
        }

        if (filter._id !== undefined) {
            filter._id = this.convertToObjectID(filter._id);
        }

        return this.userCollection.findOne(filter);
    }

    /**
     * Retrieves complete information about specific user defined by only user's _id.
     * 
     * @param id unique identifier of the user that is used internally in the MongoDB.
     * @returns Promise filled with IUser object or null if user wasn't found.
     */
    private async GetUserByObjectId(id: ObjectId): Promise<IUser | null> {
        const user = this.userCollection.findOne(
            { "_id": id }
        );

        return user;
    }

    /**
     * Creates user object in the database.
     * 
     * @param user IUser object filled with information about user.
     * @throws IncorrectSchema exception when IUser doesn't have correct format.
     * @returns Promise filled with IUser object or null if user wasn't created.
     */
    async CreateUser(user: IUser): Promise<IUser | null> {
        let userSchema = await this.convertToUserSchema(user)

        let insertResult = await this.userCollection.insertOne(userSchema);

        return this.GetUserByObjectId(insertResult.insertedId);
    }

    /**
     * Updates user object in the database
     * 
     * @param id unique identifier of the user that is used internally in the MongoDB.
     * @param user IUser object filled with information about user.
     * @throws IncorrectSchema exception when IUser doesn't have correct format.
     * @throws EmptyID exception when id is empty.
     * @throws IncorrectIDFormat exception when id has incorrect format.
     * @returns Promise filled with updated IUser object or null if user wasn't updated.
     */
    async UpdateUser(id: string, user: IUser): Promise<IUser | null> {
        let userSchema = await this.convertToUserSchema(user);

        let objectID = this.convertToObjectID(id);

        let existingUser = await this.GetUserByObjectId(objectID);

        if (existingUser === null) {
            return new Promise(resolve => resolve(null));
        }

        await this.userCollection.updateOne(
            { "_id": objectID },
            {
                $set:
                {
                    "uid": userSchema.uid,
                    "firstName": userSchema.firstName,
                    "lastName": userSchema.lastName,
                    "lastSeen": userSchema.lastSeen,
                    "inventory": userSchema.inventory
                }
            }
        );

        return this.GetUserByObjectId(objectID);
    }

    /**
     * Deletes user object from database.
     * 
     * @param id unique identifier of the user that is used internally in the MongoDB.
     * @throws EmptyID exception when id is empty.
     * @throws IncorrectIDFormat exception when id has incorrect format.
     * @returns Promise filled with boolean value indication status of the operation.
     */
    async DeleteUser(id: string): Promise<boolean> {
        let objectID = this.convertToObjectID(id);

        let existingUser = await this.GetUserByObjectId(objectID);

        if (existingUser === null) {
            return new Promise(resolve => resolve(false));
        }

        let deleteResult = await this.userCollection.deleteOne(
            { "_id": objectID }
        );

        return new Promise(resolve => resolve(deleteResult.deletedCount === 1));
    }
}
