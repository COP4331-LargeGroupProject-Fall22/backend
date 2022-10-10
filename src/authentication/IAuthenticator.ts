import { NextFunction, Request, Response } from "express";

export interface IAuthenticator {
    authenticate(req: Request, res: Response, next: NextFunction): void
}