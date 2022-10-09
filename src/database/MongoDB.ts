import * as dotenv from 'dotenv';
dotenv.config();

import { MongoClient, Collection, Db, ObjectId } from 'mongodb';
import { exit } from 'process';

import { IUser } from '../api/model/user/IUser';
import { IDatabase } from './IDatabase';

export class MongoDB implements IDatabase {
    protected static dbURL: string = process.env.DB_CONNECTION_STRING!;
    protected static dbName: string = process.env.DB_NAME!;
    protected static collectionName: string = process.env.DB_USERS_COLLECTION!;

    protected client!: MongoClient;

    protected database!: Db;
    protected userCollection!: Collection<IUser>;

    constructor() {}

    connectToDatabase(): MongoDB {
        try {
            this.client = new MongoClient(MongoDB.dbURL);
        
            this.database = this.client.db(MongoDB.dbName);
            this.userCollection = this.database.collection<IUser>(MongoDB.collectionName);

            return this;
        } catch(e) {
            console.log('Boom!');
            exit(1);
        } finally {
            console.log(`Successfully connected to database: ${this.database.databaseName} and collection: ${this.userCollection.collectionName}`);
        }
    }

    async GetUsers(parameters: Object | null = null): Promise<IUser[] | null> {
        // type Summary = Pick<IUser, "name">;
        const users = this.userCollection.find();
        
        return users.toArray();
    }

    async GetUser(parameters: Map<String, String> | null): Promise<IUser | null> {
        const user = this.userCollection.findOne(
            { username: parameters?.get("username") }
        );

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
                    "username": user.username,
                    "password": user.password,
                    "firstName": user.firstName,
                    "lastName": user.lastName,
                    "email": user.email,
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