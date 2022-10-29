/**
 * This file is responsible for extension of the Request interface provided by Express.js.
 */

import superagent from "superagent";
import IUserIdentification from "../../serverAPI/model/user/IIdentification";
import IServerUser from "../../serverAPI/model/user/IServerUser";

declare module "supertest" {
    interface Test extends superagent.SuperAgentRequest {
        uid?: string;
    }
}

declare module "express-serve-static-core" {
    interface Request {
        serverUser: IServerUser;
    }
}

declare global {
    namespace NodeJS {
        interface ProcessEnv {
            PORT: number;
            NODE_ENV: string;

            DB_CONNECTION_STRING_TESTING: string;
            DB_CONNECTION_STRING: string;
            DB_NAME: string;
            DB_USERS_COLLECTION: string;

            SPOONACULAR_API_KEY: string;
            SPOONACULAR_HOST: string;

            SPOONACULAR_INGREDIENTS_BASE_URL: string;
            SPOONACULAR_GROCERY_PRODUCT_BASE_URL: string;
            SPOONACULAR_RECIPE_BASE_URL: string;

            FIREBASE_ADMIN_SERVICE_ACCOUNT: string;
            
            PRIVATE_KEY_FOR_USER_TOKEN: string;
        }

    }
}

export { };
