"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ResponseFormatter_1 = __importDefault(require("../../utils/ResponseFormatter"));
const ResponseTypes_1 = require("../../utils/ResponseTypes");
/**
 * This class creates several properties responsible for authentication actions
 * provided to the user.
 */
class AuthenticationController {
    constructor(database) {
        /**
         * Lets client to login into the server using token from authorization header.
         * Upon successful login operation, this handler will redirect user to the /api/user route.
         *
         * @param req Request parameter that holds information about request
         * @param res Response parameter that holds information about response
         */
        this.login = async (req, res) => {
            let parameters = new Map([
                ["uid", req.uid]
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
                res.status(400).json(ResponseFormatter_1.default.formatAsJSON(ResponseTypes_1.ResponseTypes.ERROR, `User doesn't exists.`));
                return;
            }
            // Workaround has yet to be found
            res.redirect(302, `/user/${user._id}`);
        };
        /**
         * Let's client to register their account on the server.
         * Client is expected to provide all required information and token in authorization header.
         * Upon successful register operation, this handler will return full information about registered user.
         *
         * @param req Request parameter that holds information about request
         * @param res Response parameter that holds information about response
         */
        this.register = async (req, res) => {
            let parameters = new Map([
                ["uid", req.uid]
            ]);
            let user;
            try {
                user = await this.database.GetUser(parameters);
            }
            catch (error) {
                res.status(400).json(ResponseFormatter_1.default.formatAsJSON(ResponseTypes_1.ResponseTypes.ERROR, this.getException(error)));
                return;
            }
            if (user !== null) {
                res.status(400).json(ResponseFormatter_1.default.formatAsJSON(ResponseTypes_1.ResponseTypes.ERROR, `User with such UID already exists.`));
                return;
            }
            const newUser = {
                uid: String(req.uid),
                firstName: req.body?.firstName,
                lastName: req.body?.lastName,
                lastSeen: Date.now(),
                inventory: []
            };
            let createdUser;
            try {
                createdUser = await this.database.CreateUser(newUser);
            }
            catch (error) {
                res.status(400).json(ResponseFormatter_1.default.formatAsJSON(ResponseTypes_1.ResponseTypes.ERROR, this.getException(error)));
                return;
            }
            if (createdUser === null) {
                res.status(400).json(ResponseFormatter_1.default.formatAsJSON(ResponseTypes_1.ResponseTypes.ERROR, "Couldn't create user."));
                return;
            }
            res.status(200).json(ResponseFormatter_1.default.formatAsJSON(ResponseTypes_1.ResponseTypes.SUCCESS, createdUser));
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
exports.default = AuthenticationController;
//# sourceMappingURL=AuthenticationController.js.map