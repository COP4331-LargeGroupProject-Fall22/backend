import { NextFunction, Request, Response } from 'express';
import IAuthenticator from './IAuthenticator';
import * as admin from 'firebase-admin'
import ResponseFormatter from '../../../utils/ResponseFormatter';
import { ResponseTypes } from '../../../utils/ResponseTypes';

admin.initializeApp({
    credential: admin.credential.applicationDefault(),
});

/**
 * This class implements IAuthenticator interface and creates a middleware which is based on Firebase-Admin API and can be used
 * for authentication of the accessToken.
 */
export default class Authenticator implements IAuthenticator {
    constructor() { }
    /**
     * This method provides authnetication logic for user authentication using Firebase-Admin API and
     * accessToken which is accessed through authorization header of the request.
     * 
     * @param req Request parameter that holds information about request
     * @param res Response parameter that holds information about response
     * @param next Next parameter that holds a pointer to the NextFunction
     */
    authenticate(req: Request, res: Response, next: NextFunction) {
        if (req.headers.authorization) {
            admin.auth().verifyIdToken((req.headers.authorization)).then(
                token => {
                    req.uid = token.uid;

                    next();
                }).catch(() => {
                    res.status(401).send(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, "User authorization failed."));
                    return;
                });
        } else {
            res.status(401).send(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, "Token is empty or invalid."));
        }
    }
}
