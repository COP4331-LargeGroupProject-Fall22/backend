import { NextFunction, Request, Response } from 'express';

export class Logger {
    static consoleLog(req: Request, res: Response, next: NextFunction) {
        let date = new Date();

        console.log(req.method, req.url, res.statusCode, date.toUTCString());
        next();
    }
}
