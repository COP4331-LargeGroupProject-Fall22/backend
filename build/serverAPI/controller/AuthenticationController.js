"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ResponseFormatter_1 = __importDefault(require("../../utils/ResponseFormatter"));
const ResponseTypes_1 = require("../../utils/ResponseTypes");
const Validator_1 = require("../../utils/Validator");
const UserSchema_1 = __importDefault(require("../model/user/UserSchema"));
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
            if (req.uid === undefined) {
                res.status(400).json(ResponseFormatter_1.default.formatAsJSON(ResponseTypes_1.ResponseTypes.ERROR, "UID hasn't been found."));
                return;
            }
            let parameters = new Map([
                ["uid", req.uid]
            ]);
            let user = await this.database.GetUser(parameters);
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
            if (req.uid === undefined) {
                res.status(400).json(ResponseFormatter_1.default.formatAsJSON(ResponseTypes_1.ResponseTypes.ERROR, "UID hasn't been found."));
                return;
            }
            let parameters = new Map([
                ["uid", req.uid]
            ]);
            const newUser = new UserSchema_1.default(req.body?.firstName, req.body?.lastName, req.uid);
            const validator = new Validator_1.Validator();
            let logs = await validator.validate(newUser);
            if (logs.length > 0) {
                res.status(400).json(ResponseFormatter_1.default.formatAsJSON(ResponseTypes_1.ResponseTypes.ERROR, logs));
                return;
            }
            let user = await this.database.GetUser(parameters);
            if (user !== null) {
                res.status(400).json(ResponseFormatter_1.default.formatAsJSON(ResponseTypes_1.ResponseTypes.ERROR, `User with such UID already exists.`));
                return;
            }
            let createdUser = await this.database.CreateUser(newUser);
            if (createdUser === null) {
                res.status(400).json(ResponseFormatter_1.default.formatAsJSON(ResponseTypes_1.ResponseTypes.ERROR));
                return;
            }
            res.status(200).json(ResponseFormatter_1.default.formatAsJSON(ResponseTypes_1.ResponseTypes.SUCCESS, createdUser));
        };
        this.database = database;
    }
}
exports.default = AuthenticationController;
//# sourceMappingURL=AuthenticationController.js.map