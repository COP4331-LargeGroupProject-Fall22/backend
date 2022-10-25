"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRoute = void 0;
/**
 * This file is responsible for construction of the routes for UserController.
 */
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const express_1 = __importDefault(require("express"));
const UserController_1 = __importDefault(require("../controller/UserController"));
const UserDatabase_1 = __importDefault(require("../../database/UserDatabase"));
const Authenticator_1 = __importDefault(require("../middleware/authentication/Authenticator"));
const InventoryController_1 = __importDefault(require("../controller/InventoryController"));
exports.userRoute = express_1.default.Router();
let databaseURL = process.env.DB_CONNECTION_STRING;
let databaseName = process.env.DB_NAME;
let collectionName = process.env.DB_USERS_COLLECTION;
const database = UserDatabase_1.default.connect(databaseURL, databaseName, collectionName);
const userController = new UserController_1.default(database);
const inventoryController = new InventoryController_1.default(database);
exports.userRoute.use(new Authenticator_1.default().authenticate);
exports.userRoute.get('/', userController.getUsers);
exports.userRoute.get('/user/:userID', userController.getUser);
exports.userRoute.route('/user/:userID')
    .delete(userController.deleteUser)
    .put(express_1.default.urlencoded({ extended: true }), userController.updateUser);
exports.userRoute.get('/user/:userID/foods', inventoryController.getFoods);
exports.userRoute.post('/user/:userID/foods/food', express_1.default.urlencoded({ extended: true }), inventoryController.addFood);
exports.userRoute.get('/user/:userID/foods/food/:foodID', inventoryController.getFood);
exports.userRoute.put('/user/:userID/foods/food/:foodID', express_1.default.urlencoded({ extended: true }), inventoryController.updateFood);
exports.userRoute.delete('/user/:userID/foods/food/:foodID', inventoryController.deleteFood);
//# sourceMappingURL=UserRoutes.js.map