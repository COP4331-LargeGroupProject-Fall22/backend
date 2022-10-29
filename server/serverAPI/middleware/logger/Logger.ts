import { NextFunction, Request, Response } from 'express';

/**
 * This class is used for real-time logging of the API request.
 */
export default class Logger {
    /**
     * This method is used for console logging of the API request related information.
     * 
     * @param req Request parameter that holds information about request.
     * @param res Response parameter that holds information about response.
     * @param next Next parameter that holds a pointer to the NextFunction.
     */
    static consoleLog(req: Request, res: Response, next: NextFunction): void {
        let date = new Date();

        console.log(req.method, req.url, date.toUTCString());
        next();
    }
}
