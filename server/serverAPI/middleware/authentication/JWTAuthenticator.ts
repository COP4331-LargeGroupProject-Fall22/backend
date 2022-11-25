import { Request, Response, NextFunction } from 'express';
import { ResponseCodes } from '../../../utils/ResponseCodes';

import TokenCreator from '../../../utils/TokenCreator';

import BaseController from '../../controller/BaseController/BaseController';

import IIdentification from '../../model/internal/user/IIdentification';

import JWTStorage from './JWTStorage';

export default class JWTAuthenticator extends BaseController {
    authenticate = (tokenCreator: TokenCreator<IIdentification>) =>
        (req: Request, res: Response, next: NextFunction) => {
            if (!req.headers.authorization) {
                return this.send(ResponseCodes.UNAUTHORIZED, res, "Token is invalid.");
            }

            let authHeaderItems = req.headers.authorization.split(' ');

            // According to specifications, accessToken is prefixed with Bearer.
            // This logic removes Bearer if it exists.
            let accessToken: string = authHeaderItems.length === 2 ? authHeaderItems[1] : authHeaderItems[0];

            let userIdentification: IIdentification;
            try {
                userIdentification = tokenCreator.verify(accessToken.trim());
            } catch (error) {
                return this.send(ResponseCodes.UNAUTHORIZED, res, this.getException(error));
            }

            if (!JWTStorage.getInstance().hasJWT(userIdentification.username) ||
                JWTStorage.getInstance().getJWT(userIdentification.username)?.accessToken !== accessToken
            ) {
                return this.send(ResponseCodes.UNAUTHORIZED, res, "Token is not assigned to the user.");
            }

            req.serverUser = userIdentification;
            next();
        }
}
