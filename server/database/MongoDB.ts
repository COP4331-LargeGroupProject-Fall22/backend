import * as dotenv from 'dotenv';
dotenv.config();

import { MongoClient, Collection, Db, ObjectId, Filter } from 'mongodb';
import { exit } from 'process';

import { IUser } from '../api/model/user/IUser';
import { IUserDatabase } from './IUserDatabase';

/**
 * This class implements IUserDatabase interface using MongoDB database.
 * It uses Singelton design pattern to avoid establishing several connection to the same database inside of one
 * application instance.
 */
export class MongoDB implements IUserDatabase {
    protected static dbURL: string = process.env.DB_CONNECTION_STRING!;
    protected static dbName: string = process.env.DB_NAME!;
    protected static collectionName: string = process.env.DB_USERS_COLLECTION!;

    private static instance: MongoDB;

    protected client!: MongoClient;

    protected database!: Db;
    protected userCollection!: Collection<IUser>;

    /**
     * Initializes MongoClient, database and userCollection properties of the MongoDB class.
     * @returns MongoDB object.
     */
    private constructor() {
        try {
            this.client = new MongoClient(MongoDB.dbURL);
        
            this.database = this.client.db(MongoDB.dbName);
            this.userCollection = this.database.collection<IUser>(MongoDB.collectionName);

            return this;
        } catch(e) {
            console.log('💥 Boom!');
            exit(1);
        } finally {
            console.log(`☁️ Successfully connected to database: ${this.database.databaseName} and collection: ${this.userCollection.collectionName}`);
        }
    }
    
    /**
     * Connects to the database if connection doesn't already exist.
     * 
     * @returns MongoDB object.
     */
    static connectToDatabase(): MongoDB {
        if (!MongoDB.instance) {
            MongoDB.instance = new MongoDB();
        }

        return MongoDB.instance;
    }

    /**
     * This method is used for getting summary of all user objects in the database.
     * Summary will contain only non-sensitive information about users.
     * 
     * @param parameters query parameters used for searching.
     * @returns Promise filled with Partial<IUser> where each IUser object will contain only non-sensitive information or null if useres weren't found.
     */
    async GetUsers(parameters?: Map<String, any>): Promise<Partial<IUser>[] | null> {
        const users = this.userCollection.find()
            .project({ firstName:1, lastName:1, lastSeen:1, _id: 0 });

        return users.toArray();
    }

    /**
     * This method is used for getting complete information about user object in the database.
     * This information will include everything about user, including their sensitive information.
     * 
     * @param parameters query parameters used for searching.
     * @returns Promised filled with IUser object or null if user wasn't found.
     */
    async GetUser(parameters: Map<String, any>): Promise<IUser | null> { 
        let filter: Filter<any> = Object.fromEntries(parameters);
        
        if (filter._id !== undefined) {
            filter._id = new ObjectId(filter._id);
        }
        
        const user = this.userCollection.findOne(filter);

        return user;
    }

    /**
     * This method is used for getting complete information about user object in the database based on their internal "_id".
     * 
     * @param id unique identifier of the user that is used internally in the MongoDB.
     * @returns Promis filled with IUser object or null if user wasn't found.
     */
    private async GetUserById(id: string): Promise<IUser | null> {
        const user = this.userCollection.findOne(
            { "_id" : new ObjectId(id) }
        );

        return user;
    }
    
    /**
     * This method is used for creation of the user object in the MongoDB.
     * 
     * @param user IUser object filled with information about user.
     * @returns Promise filled with IUser object or null if user wasn't created.
     */
    async CreateUser(user: IUser): Promise<IUser | null> {
        let insertResult = await this.userCollection.insertOne(user);

        return this.GetUserById(insertResult.insertedId.toString());
    }

    /**
     * This method is used for updating of the user object in the MongoDB.
     * 
     * @param id unique identifier of the user that is used internally in the MongoDB.
     * @param user IUser object filled with information about user.
     * @returns Promise filled with updated IUser object or null if user wasn't updated.
     */
    async UpdateUser(id: string, user: IUser): Promise<IUser | null> {
        await this.userCollection.updateOne(
            { "_id" : new ObjectId(id) },
            { 
                $set: 
                {
                    "uid": user.uid,
                    "firstName": user.firstName,
                    "lastName": user.lastName,
                    "lastSeen": user.lastSeen
                }
            }
        );

        return this.GetUserById(id);
    }

    /**
     * This method is used for deletion of the user object in the MongoDB.
     * 
     * @param id unique identifier of the user that is used internally in the MongoDB.
     * @returns Promise filled with boolean value indication status of the operation.
     */
    async DeleteUser(id: string): Promise<boolean> {
        let deleteResult = await this.userCollection.deleteOne(
            { "_id": new ObjectId(id) }
        );

        return Promise.resolve(deleteResult.deletedCount >= 1);
    }
}
