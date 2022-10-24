/**
 * This file is responsible for extension of the Request interface provided by Express.js.
 */

import superagent from "superagent";

declare module "supertest" {
    interface Test extends superagent.SuperAgentRequest {
        uid?: string;
    }
}

declare module "express-serve-static-core" {
    interface Request {
        uid?: string;
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

            FOOD_DATA_CENTRAL_API_KEY: string;
            FOOD_DATA_CENTRAL_SEARCH_URL: string;

            SPOONACULAR_API_KEY: string;
            SPOONACULAR_INGREDIENTS_BASE_URL: string;
            SPOONACULAR_GROCERY_PRODUCT_GET_INFO_BY_UPC_URL: string;
        }

    }
}

export { };
