"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
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
            let users;
            try {
                users = await this.database.GetUsers();
            }
            catch (error) {
                res.status(400).json(ResponseFormatter_1.default.formatAsJSON(ResponseTypes_1.ResponseTypes.ERROR, this.getException(error)));
                return;
            }
            res.status(200).json(ResponseFormatter_1.default.formatAsJSON(ResponseTypes_1.ResponseTypes.SUCCESS, users));
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
            let parameters = new Map([
                ["_id", req.params.userID]
            ]);
            let user;
            try {
                user = await this.database.GetUser(parameters);
            }
            catch (error) {
                res.status(400).json(ResponseFormatter_1.default.formatAsJSON(ResponseTypes_1.ResponseTypes.ERROR, this.getException(error)));
                return;
            }
            if (user === null) {
                res.status(404).json(ResponseFormatter_1.default.formatAsJSON(ResponseTypes_1.ResponseTypes.ERROR, "User hasn't been found."));
                return;
            }
            res.status(200).json(ResponseFormatter_1.default.formatAsJSON(ResponseTypes_1.ResponseTypes.SUCCESS, user));
            // if (user.uid !== req.params.uid) {
            //     res.status(400).json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, "Cannot access other people information."));
            //     return;
            // }
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
            let parameters = new Map([
                ["_id", req.params.userID]
            ]);
            let user;
            try {
                user = await this.database.GetUser(parameters);
            }
            catch (error) {
                res.status(400).json(ResponseFormatter_1.default.formatAsJSON(ResponseTypes_1.ResponseTypes.ERROR, this.getException(error)));
                return;
            }
            if (user === null) {
                res.status(404).json(ResponseFormatter_1.default.formatAsJSON(ResponseTypes_1.ResponseTypes.ERROR, "User hasn't been found."));
                return;
            }
            let updatedUser;
            try {
                updatedUser = await this.database.UpdateUser(req.params.userID, {
                    uid: req.body?.uid,
                    firstName: req.body?.firstName,
                    lastName: req.body?.lastName,
                    lastSeen: user.lastSeen,
                    inventory: user.inventory
                });
            }
            catch (error) {
                res.status(400).json(ResponseFormatter_1.default.formatAsJSON(ResponseTypes_1.ResponseTypes.ERROR, this.getException(error)));
                return;
            }
            if (updatedUser === null) {
                res.status(404).json(ResponseFormatter_1.default.formatAsJSON(ResponseTypes_1.ResponseTypes.ERROR, "User couldn't been updated."));
                return;
            }
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
            let parameters = new Map([
                ["_id", req.params.userID]
            ]);
            let user;
            try {
                user = await this.database.GetUser(parameters);
            }
            catch (error) {
                res.status(400).json(ResponseFormatter_1.default.formatAsJSON(ResponseTypes_1.ResponseTypes.ERROR, this.getException(error)));
                return;
            }
            if (user === null) {
                res.status(404).json(ResponseFormatter_1.default.formatAsJSON(ResponseTypes_1.ResponseTypes.ERROR, "User hasn't been found."));
                return;
            }
            // if (user.uid !== req.params.uid) {
            //     res.status(400).json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, "Cannot access other people information."));
            //     return;
            // }
            let result;
            try {
                result = await this.database.DeleteUser(req.params.userID);
            }
            catch (error) {
                res.status(400).json(ResponseFormatter_1.default.formatAsJSON(ResponseTypes_1.ResponseTypes.ERROR, this.getException(error)));
                return;
            }
            if (!result) {
                res.status(404).json(ResponseFormatter_1.default.formatAsJSON(ResponseTypes_1.ResponseTypes.ERROR, "Delete was unsuccessful."));
                return;
            }
            res.status(200).json(ResponseFormatter_1.default.formatAsJSON(ResponseTypes_1.ResponseTypes.SUCCESS));
        };
        this.database = database;
    }
    getException(error) {
        if (error instanceof Error) {
            return error.message;
        }
        return String(error);
    }
}
exports.default = UserController;
//# sourceMappingURL=UserController.js.map