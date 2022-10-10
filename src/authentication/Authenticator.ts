import { NextFunction, Request, Response } from 'express';
import { IAuthenticator } from './IAuthenticator';
import * as admin from 'firebase-admin'

admin.initializeApp({
    credential: admin.credential.applicationDefault(),
});

export class Authenticator implements IAuthenticator{
    authenticate(req: Request, res: Response, next: NextFunction) {
        if (req.headers.authorization) {
            admin.auth().verifyIdToken((req.headers.authorization)).then(
                token => {
                    req.uid = token.uid; 

                    next();
                }).catch(() => {
                    res.status(403).send({ success: false, data: { isAuthorized: "User authorization failed" } });
                });
        }
        else
            res.status(403).send({ success: false, data: { isValidToken: "Token is empty or invalid" } });
    }
}
