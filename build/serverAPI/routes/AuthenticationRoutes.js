"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticationRoute = void 0;
/**
 * This file is responsible for construction of the routes for AuthenticationController.
 */
const express_1 = __importDefault(require("express"));
const AuthenticationController_1 = __importDefault(require("../controller/AuthenticationController"));
const Authenticator_1 = __importDefault(require("../middleware/authentication/Authenticator"));
const UserDatabase_1 = __importDefault(require("../../database/UserDatabase"));
exports.authenticationRoute = express_1.default.Router();
let databaseURL = process.env.DB_CONNECTION_STRING;
let databaseName = process.env.DB_NAME;
let collectionName = process.env.DB_USERS_COLLECTION;
const authenticationController = new AuthenticationController_1.default(UserDatabase_1.default.connect(databaseURL, databaseName, collectionName));
exports.authenticationRoute.use(express_1.default.urlencoded({ extended: true }));
exports.authenticationRoute.use(new Authenticator_1.default().authenticate);
exports.authenticationRoute.get("/login", authenticationController.login);
exports.authenticationRoute.post("/register", authenticationController.register);
//# sourceMappingURL=AuthenticationRoutes.js.map