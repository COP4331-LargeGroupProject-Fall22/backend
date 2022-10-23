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
const admin = __importStar(require("firebase-admin"));
const ResponseFormatter_1 = __importDefault(require("../../../utils/ResponseFormatter"));
const ResponseTypes_1 = require("../../../utils/ResponseTypes");
admin.initializeApp({
    credential: admin.credential.applicationDefault(),
});
/**
 * This class implements IAuthenticator interface and creates a middleware which is based on Firebase-Admin API and can be used
 * for authentication of the accessToken.
 */
class Authenticator {
    constructor() { }
    /**
     * This method provides authnetication logic for user authentication using Firebase-Admin API and
     * accessToken which is accessed through authorization header of the request.
     *
     * @param req Request parameter that holds information about request
     * @param res Response parameter that holds information about response
     * @param next Next parameter that holds a pointer to the NextFunction
     */
    authenticate(req, res, next) {
        if (req.headers.authorization) {
            admin.auth().verifyIdToken((req.headers.authorization)).then(token => {
                req.uid = token.uid;
                next();
            }).catch(() => {
                res.status(403).send(ResponseFormatter_1.default.formatAsJSON(ResponseTypes_1.ResponseTypes.ERROR, "User authorization failed."));
                return;
            });
        }
        res.status(403).send(ResponseFormatter_1.default.formatAsJSON(ResponseTypes_1.ResponseTypes.ERROR, "Token is empty or invalid."));
    }
}
exports.default = Authenticator;
//# sourceMappingURL=Authenticator.js.map