import { Request, Response } from "express";
import IDatabase from "../../database/IDatabase";
import Encryptor from "../../utils/Encryptor";
import UserLoginSchema from "../model/user/requestSchema/UserLoginSchema";
import UserRegistrationSchema from "../model/user/requestSchema/UserRegistrationSchema";
import TokenCreator from "../../utils/TokenCreator";
import IIdentification from "../model/user/IIdentification";
import IUser from "../model/user/IUser";
import BaseUserController from "./BaseUserController";
import JWTStorage from "../middleware/authentication/JWTStorage";
import Token from "../model/token/Token";

/**
 * This class creates several properties responsible for authentication actions 
 * provided to the user.
 */
export default class AuthenticationController extends BaseUserController {
    private encryptor: Encryptor;
    private tokenCreator: TokenCreator<IIdentification>;

    // 30 minutes in seconds.
    protected accessTokenTimeoutInSeconds = 15 * 60;
    protected refreshTokenTimeoutInSeconds = 24 * 60 * 60;

    constructor(
        database: IDatabase<IUser>,
        encryptor: Encryptor,
        tokenCreator: TokenCreator<IIdentification>
    ) {
        super(database);

        this.database = database;
        this.encryptor = encryptor;
        this.tokenCreator = tokenCreator;
    }

    private convertToUser(userCredentials: UserRegistrationSchema): IUser {
        return {
            username: userCredentials.username,
            password: userCredentials.password,
            firstName: userCredentials.firstName,
            lastName: userCredentials.lastName,
            lastSeen: userCredentials.lastSeen,
            inventory: [],
            shoppingList: []
        }
    }

    /**
     * Logs client into the server using token from authorization header.
     * 
     * @param req Request parameter that holds information about request.
     * @param res Response parameter that holds information about response.
     */
    login = async (req: Request, res: Response) => {
        let userCredentials = new UserLoginSchema(
            req.body?.username,
            req.body?.password
        );

        try {
            userCredentials = await this.verifySchema(userCredentials, res);

            let user = await this.database.Get(new Map([["username", userCredentials.username]]));

            if (user === null) {
                return this.sendError(404, res, "User could not be found.");
            }

            let result = await this.encryptor.compare(userCredentials.password, user.password);
            if (!result) {
                return this.sendError(403, res, `User credentials are incorrect.`);
            }

            let identification: IIdentification = {
                username: user.username
            };


            let accessToken = this.tokenCreator.sign(identification, this.accessTokenTimeoutInSeconds);
            let refreshToken = this.tokenCreator.sign(identification, this.refreshTokenTimeoutInSeconds);

            JWTStorage.getInstance().addJWT(
                userCredentials.username,
                new Token(accessToken, refreshToken)
            );

            if (req.query.includeInfo === 'true') {
                return this.sendSuccess(200, res, {
                    accessToken: accessToken,
                    refreshToken: refreshToken,
                    userInfo: this.convertToUserResponse(user)
                });
            } else {
                return this.sendSuccess(200, res, {
                    accessToken: accessToken,
                    refreshToken: refreshToken
                });
            }
        } catch (e) {
            return e;
        }
    }

    refreshToken = async (req: Request, res: Response) => {
        try {
            let identification = this.tokenCreator.verify(req.body.refreshToken);

            let accessToken = this.tokenCreator.sign({ username: identification.username }, this.accessTokenTimeoutInSeconds);

            JWTStorage.getInstance().addJWT(
                identification.username,
                new Token(accessToken, req.body.refreshToken)
            );

            return this.sendSuccess(200, res, {
                accessToken: accessToken
            });
        } catch (e) {
            return this.sendError(401, res, "Refresh token is invalid.");
        }
    }

    /**
     * Registers client account on the server.
     * 
     * @param req Request parameter that holds information about request.
     * @param res Response parameter that holds information about response.
     */
    register = async (req: Request, res: Response) => {
        let userCredentials = new UserRegistrationSchema(
            req.body?.firstName,
            req.body?.lastName,
            req.body?.username,
            req.body?.password
        );

        try {
            userCredentials = await this.verifySchema(userCredentials, res);

            let user = await this.database.Get(new Map([["username", userCredentials.username]]));
            if (user !== null) {
                return this.sendError(400, res, `User with such username already exists.`);
            }

            let internalUser = this.convertToUser(userCredentials);
            internalUser.password = await this.encryptor.encrypt(internalUser.password);

            let createdUser = await this.database.Create(internalUser);
            if (createdUser === null) {
                return this.sendError(400, res, `User could not be created.`);
            }

            return this.sendSuccess(200, res);
        } catch (e) {
            return e;
        }
    }
}
