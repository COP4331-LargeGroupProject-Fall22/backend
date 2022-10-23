"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * This class is used for real-time logging of the API request.
 */
class Logger {
    /**
     * This method is used for console logging of the API request related information.
     *
     * @param req Request parameter that holds information about request
     * @param res Response parameter that holds information about response
     * @param next Next parameter that holds a pointer to the NextFunction
     */
    static consoleLog(req, res, next) {
        let date = new Date();
        console.log(req.method, req.url, date.toUTCString());
        next();
    }
}
exports.default = Logger;
//# sourceMappingURL=Logger.js.map