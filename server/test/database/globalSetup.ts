import { MongoClient } from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';

import * as dotenv from 'dotenv';
dotenv.config();

export = async function globalSetup() {
  // Config to decided if an mongodb-memory-server instance should be used
  // it's needed in global space, because we don't want to create a new instance every test-suite
  const instance = await MongoMemoryServer.create();
  const uri = instance.getUri();

  (global as any).__MONGOINSTANCE = instance;

  process.env.DB_CONNECTION_STRING_TESTING = uri.slice(0, uri.lastIndexOf('/'));

  let client = await MongoClient.connect(process.env.DB_CONNECTION_STRING_TESTING);
  await client.db(process.env.DB_NAME).dropDatabase();
  await client.db(process.env.DB_NAME).createCollection(process.env.DB_USERS_COLLECTION);

  await client.close();
};
