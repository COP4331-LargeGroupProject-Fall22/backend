import * as dotenv from 'dotenv';
dotenv.config();

import { Request, Response, NextFunction } from 'express';
import ResponseFormatter from '../../../utils/ResponseFormatter';
import { ResponseTypes } from '../../../utils/ResponseTypes';
import TokenCreator from '../../../utils/TokenCreator';
import IUserIdentification from '../../model/user/IUserIdentification';

export default class JWTAuthenticator {

    private getException(error: unknown): string {
        if (error instanceof Error) {
            return error.message;
        }

        return String(error);
    }

    authenticate = (tokenCreator: TokenCreator<IUserIdentification>) => (req: Request, res: Response, next: NextFunction): void => {
        if (!req.headers.authorization) {
            res.status(401).json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, "Token is invalid"));
            return;
        }

        let userIdentification: any;
        try {
            userIdentification = tokenCreator.verify(req.headers.authorization.trim());
        } catch(error) {
            res.status(403).json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, this.getException(error)));
            return;
        }

        req.userIdentification = userIdentification;
        next();
    }
}
