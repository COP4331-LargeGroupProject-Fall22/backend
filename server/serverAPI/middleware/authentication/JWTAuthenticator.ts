import { Request, Response, NextFunction } from 'express';
import ResponseFormatter from '../../../utils/ResponseFormatter';
import { ResponseTypes } from '../../../utils/ResponseTypes';
import TokenCreator from '../../../utils/TokenCreator';
import IIdentification from '../../model/user/IIdentification';

export default class JWTAuthenticator {

    private getException(error: unknown): string {
        if (error instanceof Error) {
            return error.message;
        }

        return String(error);
    }

    authenticate = (tokenCreator: TokenCreator<IIdentification>) =>
        (req: Request, res: Response, next: NextFunction) => {
            if (!req.headers.authorization) {
                return res.status(401)
                    .json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, "Token is invalid"));
            }

            let userIdentification: IIdentification;
            try {
                userIdentification = tokenCreator.verify(req.headers.authorization.trim());
            } catch (error) {
                return res.status(403)
                    .json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, this.getException(error)));
            }

            req.serverUser = userIdentification;
            next();
        }
}
