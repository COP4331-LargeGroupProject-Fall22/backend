import * as dotenv from 'dotenv';
dotenv.config();

import { MongoClient, Collection, Db, ObjectId, Filter } from 'mongodb';
import { exit } from 'process';

import { IUser } from '../api/model/user/IUser';
import { IUserDatabase } from './IUserDatabase';

export class MongoDB implements IUserDatabase {
    protected static dbURL: string = process.env.DB_CONNECTION_STRING!;
    protected static dbName: string = process.env.DB_NAME!;
    protected static collectionName: string = process.env.DB_USERS_COLLECTION!;

    private static instance: MongoDB;

    protected client!: MongoClient;

    protected database!: Db;
    protected userCollection!: Collection<IUser>;

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

    static connectToDatabase(): MongoDB {
        if (!MongoDB.instance)
            MongoDB.instance = new MongoDB();
        
        return MongoDB.instance;
    }

    async GetUsers(parameters?: Map<String, any>): Promise<Partial<IUser>[] | null> {
        const users = this.userCollection.find()
            .project({ firstName:1, lastName:1, lastSeen:1, _id: 0 });

        return users.toArray();
    }

    async GetUser(parameters: Map<String, any>): Promise<IUser | null> { 
        let filter: Filter<any> = Object.fromEntries(parameters);
        
        if (filter._id !== undefined)
            filter._id = new ObjectId(filter._id);

        const user = this.userCollection.findOne(filter);

        return user;
    }

    private async GetUserById(id: string): Promise<IUser | null> {
        const user = this.userCollection.findOne(
            { "_id" : new ObjectId(id) }
        );

        return user;
    }
    
    async CreateUser(user: IUser): Promise<IUser | null> {
        let insertResult = await this.userCollection.insertOne(user);

        return this.GetUserById(insertResult.insertedId.toString());
    }

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

    async DeleteUser(id: string): Promise<boolean> {
        let deleteResult = await this.userCollection.deleteOne(
            { "_id": new ObjectId(id) }
        );

        return Promise.resolve(deleteResult.deletedCount >= 1);
    }
}
