/**
 * This file is responsible for extension of the Request interface provided by Express.js.
 */

import { Request } from "express-serve-static-core";

declare module "express-serve-static-core" {
    export interface Request {
        uid?: string;
    }
}

declare global {
    namespace NodeJS {
        interface ProcessEnv {
            DB_CONNECTION_STRING_TESTING: string;
            DB_CONNECTION_STRING: string;
            DB_NAME: string;
            DB_USERS_COLLECTION: string;
        }
    }
}

export { };
