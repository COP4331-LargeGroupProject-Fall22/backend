import { NextFunction, Request, Response } from "express";

/**
 * Authenticator interface.
 */
export interface IAuthenticator {
    authenticate(req: Request, res: Response, next: NextFunction): void
}
