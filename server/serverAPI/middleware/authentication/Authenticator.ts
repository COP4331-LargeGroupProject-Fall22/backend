import * as dotenv from 'dotenv';
dotenv.config();

import { NextFunction, Request, Response } from 'express';
import IAuthenticator from './IAuthenticator';
import * as admin from 'firebase-admin'
import ResponseFormatter from '../../../utils/ResponseFormatter';
import { ResponseTypes } from '../../../utils/ResponseTypes';

admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT)),
});

/**
 * This class implements IAuthenticator interface and creates a middleware which is based on Firebase-Admin API and can be used
 * for authentication of the accessToken.
 */
export default class Authenticator implements IAuthenticator {
    constructor() { }
    /**
     * This method provides authentication logic for user authentication using Firebase-Admin API and
     * accessToken which is accessed through authorization header of the request.
     * 
     * @param req Request parameter that holds information about request
     * @param res Response parameter that holds information about response
     * @param next Next parameter that holds a pointer to the NextFunction
     */
    authenticate(req: Request, res: Response, next: NextFunction) {
        if (req.headers.authorization) {
            let authHeaderItems = req.headers.authorization.split(' ');

            // According to specifications, accessToken is prefixed with Bearer
            // This logic removes Bearer if it exists
            let accessToken: string = authHeaderItems.length === 2 ? authHeaderItems[1] : authHeaderItems[0];

            admin.auth().verifyIdToken((accessToken))
                .then(token => {
                    req.uid = token.uid;

                    next();
                }).catch(() => {
                    res.status(401).send(
                        ResponseFormatter.formatAsJSON(
                            ResponseTypes.ERROR, "User authorization failed."
                        )
                    );
                    
                    return;
                });
        } else {
            res.status(401).send(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, "Token is empty or invalid."));
        }
    }
}
