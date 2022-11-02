/**
 * Entry point of the Server.
 */
import * as dotenv from 'dotenv';
dotenv.config();

process.env.DB_CONNECTION_STRING = process.env.NODE_ENV === "dev" ?  
    process.env.LOCAL_MONGODB_CONNECTION_STRING : 
    process.env.MONGODB_CONNECTION_STRING;

import { server } from "./App";

// Starts Server at specified Port
server(process.env.PORT || 5000);
