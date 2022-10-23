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
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const mongodb_1 = require("mongodb");
const process_1 = require("process");
const EmptyID_1 = __importDefault(require("../exceptions/EmptyID"));
const IncorrectIDFormat_1 = __importDefault(require("../exceptions/IncorrectIDFormat"));
const IncorrectSchema_1 = __importDefault(require("../exceptions/IncorrectSchema"));
const NoParameterFound_1 = __importDefault(require("../exceptions/NoParameterFound"));
const UserSchema_1 = __importDefault(require("../serverAPI/model/user/UserSchema"));
const Validator_1 = require("../utils/Validator");
/**
 * UserDatabase is responsible for providing an interface for the end-user filled with methods which allows
 * CRUD operations on the User collection.
 *
 * It also uses Singleton design pattern. As such, there is only one database instance that will be created through out
 * execution lifetime.
 */
class UserDatabase {
    constructor(mongoURL, name, collection) {
        try {
            this.client = new mongodb_1.MongoClient(mongoURL);
            this.database = this.client.db(name);
            this.userCollection = this.database.collection(collection);
            return this;
        }
        catch (e) {
            console.log(e);
            (0, process_1.exit)(1);
        }
    }
    /**
     * Retrieves current instance of the UserDatabase if such exists.
     *
     * @returns UserDatabase object or undefined.
     */
    static getInstance() {
        return UserDatabase.instance;
    }
    /**
     * Connects to the database if database instance doesn't exist
     *
     * @returns UserDatabase object.
     */
    static connect(mongoURL, name, collection) {
        if (UserDatabase.instance === undefined) {
            UserDatabase.instance = new UserDatabase(mongoURL, name, collection);
        }
        return UserDatabase.instance;
    }
    /**
     * Disconnects database from database provider.
     */
    async disconnect() {
        if (this.client) {
            await this.client.close();
            UserDatabase.instance = undefined;
        }
    }
    /**
     * Retrieves general information about all user objects stored in the database.
     *
     * @param parameters query parameters used for searching.
     * @returns Promise filled with Partial<IUser> where each IUser object will contain only general information or null if useres weren't found.
     */
    async GetUsers(parameters) {
        const users = this.userCollection.find()
            .project({ firstName: 1, lastName: 1, lastSeen: 1, _id: 0 });
        let userArr = users.toArray();
        if ((await userArr).length == 0) {
            return new Promise(resolve => resolve(null));
        }
        return userArr;
    }
    /**
     *
     * @param user IUser object
     * @throws IncorrectSchema exception when IUser doesn't have correct format.
     */
    async tryToValidateUser(user) {
        let definedUser = new UserSchema_1.default(user.firstName, user.lastName, user.uid);
        definedUser.inventory = user.inventory;
        definedUser.lastSeen = user.lastSeen;
        let logs = new Validator_1.Validator().validate(definedUser);
        if ((await logs).length > 0) {
            throw new IncorrectSchema_1.default(`User object doesn't have correct format.\n${logs}`);
        }
    }
    /**
     * Retrieves complete information about specific user defined by user's _id.
     *
     * @param parameters query parameters used for searching.
     * - _id - required parameter that defines user's _id.
     *
     * @throws NoParameterFound exception when required parameters weren't found.
     * @returns Promise filled with IUser object or null if user wasn't found.
     */
    async GetUser(parameters) {
        let filter = Object.fromEntries(parameters);
        if (filter._id === undefined) {
            throw new NoParameterFound_1.default("_id is missing in parameters dictionary.");
        }
        filter._id = new mongodb_1.ObjectId(filter._id);
        return this.userCollection.findOne(filter);
    }
    /**
     * Retrieves complete information about specific user defined by only user's _id.
     *
     * @param id unique identifier of the user that is used internally in the MongoDB.
     *
     * @throws EmptyID exception when id is empty.
     * @throws IncorrectIDFormat exception when id has incorrect format.
     * @returns Promise filled with IUser object or null if user wasn't found.
     */
    async GetUserById(id) {
        if (id.length === 0) {
            throw new EmptyID_1.default("_id cannot be empty string.");
        }
        let objectID;
        try {
            objectID = new mongodb_1.ObjectId(id);
        }
        catch (e) {
            throw new IncorrectIDFormat_1.default("_id should have a correct format. It can be a 24 character hex string, 12 byte binary Buffer, or a number.");
        }
        const user = this.userCollection.findOne({ "_id": objectID });
        return user;
    }
    /**
     * Creates user object in the database.
     *
     * @param user IUser object filled with information about user.
     *
     * @throws IncorrectSchema exception when IUser doesn't have correct format.
     * @returns Promise filled with IUser object or null if user wasn't created.
     */
    async CreateUser(user) {
        this.tryToValidateUser(user);
        let insertResult = await this.userCollection.insertOne(user);
        return this.GetUserById(insertResult.insertedId.toString());
    }
    /**
     * Updates user object in the database
     *
     * @param id unique identifier of the existing user.
     * @param user IUser object filled with information about user.
     *
     * @returns Promise filled with updated IUser object or null if user wasn't updated.
     */
    async UpdateUser(id, user) {
        this.tryToValidateUser(user);
        await this.userCollection.updateOne({ "_id": new mongodb_1.ObjectId(id) }, {
            $set: {
                "uid": user.uid,
                "firstName": user.firstName,
                "lastName": user.lastName,
                "lastSeen": user.lastSeen,
                "inventory": user.inventory
            }
        });
        return this.GetUserById(id);
    }
    /**
     * This method is used for deletion of the user object in the MongoDB.
     *
     * @param id unique identifier of the user that is used internally in the MongoDB.
     * @returns Promise filled with boolean value indication status of the operation.
     */
    async DeleteUser(id) {
        let deleteResult = await this.userCollection.deleteOne({ "_id": new mongodb_1.ObjectId(id) });
        return Promise.resolve(deleteResult.deletedCount >= 1);
    }
}
exports.default = UserDatabase;
//# sourceMappingURL=UserDatabase.js.map