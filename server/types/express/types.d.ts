/**
 * This file is responsible for extension of the Request interface provided by Express.js.
 */

import { Request } from "express-serve-static-core"; 

declare module "express-serve-static-core" {
    export interface Request {
        uid?: string;
    }
}

export { };
