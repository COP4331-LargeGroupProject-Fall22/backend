/**
 * Entry point of the Server.
 */
import * as dotenv from 'dotenv';
dotenv.config();

import { server } from "./App";

// Starts Server at specified Port
server(process.env.PORT || 5000);
