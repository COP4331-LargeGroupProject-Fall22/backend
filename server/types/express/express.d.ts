/**
 * This file is responsible for extension of the Request interface provided by Express.js.
 */

import superagent from "superagent";
import IIdentification from "../../serverAPI/model/user/IIdentification";

declare module "supertest" {
    interface Test extends superagent.SuperAgentRequest {
        uid?: string;
    }
}

declare module "express-serve-static-core" {
    interface Request {
        serverUser: IIdentification;
    }
}

declare global {
    namespace NodeJS {
        interface ProcessEnv {
            PORT: number;
            NODE_ENV: string;
            
            LOCAL_MONGODB_CONNECTION_STRING: string;
            MONGODB_CONNECTION_STRING: string;

            DB_CONNECTION_STRING_TESTING: string;
            DB_CONNECTION_STRING: string;

            MONGODB_CONNECTION_STRING: string;
            LOCAL_MONGODB_CONNECTION_STRING: string;

            DB_NAME: string;
            DB_USERS_COLLECTION: string;

            SPOONACULAR_API_KEY: string;
            SPOONACULAR_HOST: string;

            SPOONACULAR_INGREDIENTS_BASE_URL: string;
            SPOONACULAR_GROCERY_PRODUCT_BASE_URL: string;
            SPOONACULAR_RECIPE_BASE_URL: string;
            SPOONACULAR_CONVERTER_BASE_URL: string;
            
            PRIVATE_KEY_FOR_USER_TOKEN: string;
        }

    }
}

export { };
