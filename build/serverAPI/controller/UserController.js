"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Validator_1 = require("../../utils/Validator");
const UserSchema_1 = __importDefault(require("../model/user/UserSchema"));
const ResponseFormatter_1 = __importDefault(require("../../utils/ResponseFormatter"));
const ResponseTypes_1 = require("../../utils/ResponseTypes");
/**
 * This class creates several properties responsible for user-actions
 * provided to the user.
 */
class UserController {
    constructor(database) {
        /**
         * Lets client to get information about all users existed on the server.
         * Upon successful operation, this handler will return all users (including their non-sensitive information) existed on the server.
         *
         * @param req Request parameter that holds information about request
         * @param res Response parameter that holds information about response
         */
        this.getUsers = async (req, res) => {
            this.database.GetUsers()
                .then((users) => res.status(200).json(ResponseFormatter_1.default.formatAsJSON(ResponseTypes_1.ResponseTypes.SUCCESS, users)));
        };
        /**
         * Lets client to get information about user at specified userID.
         * Upon successful operation, this handler will return complete information about specific user only if uid of the user with accessToken and uid of the
         * user at userID are the same.
         *
         * @param req Request parameter that holds information about request
         * @param res Response parameter that holds information about response
         */
        this.getUser = async (req, res) => {
            let userID = req.params.userID;
            const validator = new Validator_1.Validator();
            let logs = await validator.validateObjectId(userID);
            if (logs.length > 0) {
                res.status(400).json(ResponseFormatter_1.default.formatAsJSON(ResponseTypes_1.ResponseTypes.ERROR, logs));
                return;
            }
            let parameters = new Map([
                ["_id", userID]
            ]);
            let user = await this.database.GetUser(parameters);
            if (user === null) {
                res.status(404).json(ResponseFormatter_1.default.formatAsJSON(ResponseTypes_1.ResponseTypes.ERROR, "User hasn't been found."));
                return;
            }
            // if (user.uid !== req.params.uid) {
            //     res.status(400).json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, "Cannot access other people information."));
            //     return;
            // }
            res.status(200).json(ResponseFormatter_1.default.formatAsJSON(ResponseTypes_1.ResponseTypes.SUCCESS, user));
        };
        /**
         * Lets client to update information of the user at specified userID.
         * Upon successful operation, this handler will return updated user object only if uid of the user with accessToken and uid of the
         * user at userID are the same.
         *
         * @param req Request parameter that holds information about request
         * @param res Response parameter that holds information about response
         */
        this.updateUser = async (req, res) => {
            let userID = req.params.userID;
            const newUser = new UserSchema_1.default(req.body?.firstName, req.body?.lastName, req.body?.uid);
            const validator = new Validator_1.Validator();
            let logs = (await validator.validate(newUser))
                .concat(await validator.validateObjectId(userID));
            if (logs.length > 0) {
                res.status(400).json(ResponseFormatter_1.default.formatAsJSON(ResponseTypes_1.ResponseTypes.ERROR, logs));
                return;
            }
            let parameters = new Map([
                ["_id", userID]
            ]);
            let user = await this.database.GetUser(parameters);
            if (user === null) {
                res.status(404).json(ResponseFormatter_1.default.formatAsJSON(ResponseTypes_1.ResponseTypes.ERROR, "User hasn't been found."));
                return;
            }
            // if (user.uid !== req.params.uid) {
            //     res.status(400).json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, "Cannot access other people information."));
            //     return;
            // }
            newUser.inventory = user.inventory;
            let updatedUser = await this.database.UpdateUser(userID, newUser);
            res.status(200).json(ResponseFormatter_1.default.formatAsJSON(ResponseTypes_1.ResponseTypes.SUCCESS, updatedUser));
        };
        /**
         * Lets client to delete user object at specified userID.
         * Upon successful operation, this handler will delete user object only if uid of the user with accessToken and uid of the
         * user at userID are the same.
         *
         * @param req Request parameter that holds information about request
         * @param res Response parameter that holds information about response
         */
        this.deleteUser = async (req, res) => {
            let userID = req.params.userID;
            const validator = new Validator_1.Validator();
            let logs = await validator.validateObjectId(userID);
            if (logs.length > 0) {
                res.status(400).json(ResponseFormatter_1.default.formatAsJSON(ResponseTypes_1.ResponseTypes.ERROR, logs));
                return;
            }
            let user = await this.database.GetUser(new Map([["_id", userID]]));
            if (user === null) {
                res.status(404).json(ResponseFormatter_1.default.formatAsJSON(ResponseTypes_1.ResponseTypes.ERROR, "User hasn't been found."));
                return;
            }
            // if (user.uid !== req.params.uid) {
            //     res.status(400).json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, "Cannot access other people information."));
            //     return;
            // }
            let result = await this.database.DeleteUser(userID);
            if (!result) {
                res.status(404).json(ResponseFormatter_1.default.formatAsJSON(ResponseTypes_1.ResponseTypes.ERROR, "Delete was unsuccessful."));
                return;
            }
            res.status(200).json(ResponseFormatter_1.default.formatAsJSON(ResponseTypes_1.ResponseTypes.SUCCESS));
        };
        this.database = database;
    }
}
exports.default = UserController;
//# sourceMappingURL=UserController.js.map