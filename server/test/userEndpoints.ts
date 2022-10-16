// import * as dotenv from 'dotenv';
// dotenv.config();

// import { UserDatabase } from '../database/MongoDB';

// import express from 'express';

// import request from 'supertest';
// import { userRoute } from '../routes/UserRoutes';
// import { Express } from 'express-serve-static-core';
// import { UserController } from '../api/controller/UserController';

// let userDB: UserDatabase

// let databaseURL;
// let databaseName; 
// let collectionName;

// let app: Express;

// beforeAll(async () => {
//     databaseURL = process.env.DB_CONNECTION_STRING_TESTING;
//     databaseName = process.env.DB_NAME;
//     collectionName =  process.env.DB_USERS_COLLECTION;

//     userDB = UserDatabase.connect(
//         databaseURL,
//         databaseName,
//         collectionName
//     );

//     app = express();

//     app.listen(5000, () => {
//         console.log('🚀 Server is running');
//     });
    
//     const userController = new UserController(userDB);

//     const userRoute = express.Router();

//     userRoute.get('/users', userController.getUsers);
//     userRoute.get('/user/:id', userController.getUser);

//     app.use('/api', userRoute);
// });

// describe('User endpoints', () => {
//     describe('Get Requests', () => {
//         it ('Get User Info', async () => {
//             request(app)
//             .get("/api/users")
//             .then( res => {
//                 expect(res.statusCode).toBe(200)
//             });
//         });
//     });
// });

// afterAll(async () => {
//     userDB.disconnect();
// });