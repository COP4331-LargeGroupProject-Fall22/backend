import { NextFunction, Request, Response } from "express";

/**
 * Authenticator interface.
 */
export default interface IAuthenticator {
    authenticate(req: Request, res: Response, next: NextFunction): void
}
