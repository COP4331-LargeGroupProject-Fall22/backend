import { Request, Response, NextFunction } from 'express';
import TokenCreator from '../../../utils/TokenCreator';
import BaseController from '../../controller/BaseController';
import IIdentification from '../../model/user/IIdentification';
import JWTStorage from './JWTStorage';

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

            if (!JWTStorage.getInstance().hasJWT(userIdentification.username) ||
                JWTStorage.getInstance().getJWT(userIdentification.username)?.accessToken !== accessToken
            ) {
                return this.sendError(400, res, "Token is not assigned to the user.");
            }

            req.serverUser = userIdentification;
            next();
        }
}
