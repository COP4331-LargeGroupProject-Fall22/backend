import { Request, Response, NextFunction } from 'express';
import TokenCreator from '../../../utils/TokenCreator';
import BaseController from '../../controller/BaseController';
import IIdentification from '../../model/user/IIdentification';

export default class JWTAuthenticator extends BaseController {
    authenticate = (tokenCreator: TokenCreator<IIdentification>) =>
        (req: Request, res: Response, next: NextFunction) => {
            if (!req.headers.authorization) {
                return this.sendError(400, res, "Token is invalid.");
            }

            let authHeaderItems = req.headers.authorization.split(' ');

            // According to specifications, accessToken is prefixed with Bearer.
            // This logic removes Bearer if it exists.
            let accessToken: string = authHeaderItems.length === 2 ? authHeaderItems[1] : authHeaderItems[0];

            let userIdentification: IIdentification;
            try {
                userIdentification = tokenCreator.verify(accessToken.trim());
            } catch (error) {
                return this.sendError(400, res, this.getException(error));
            }

            req.serverUser = userIdentification;
            next();
        }
}
