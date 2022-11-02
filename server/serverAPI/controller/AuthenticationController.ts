import { Request, Response } from "express";
import IDatabase from "../../database/IDatabase";
import Encryptor from "../../utils/Encryptor";
import UserLoginSchema from "../model/user/requestSchema/UserLoginSchema";
import UserRegistrationSchema from "../model/user/requestSchema/UserRegistrationSchema";
import TokenCreator from "../../utils/TokenCreator";
import IIdentification from "../model/user/IIdentification";
import IUser from "../model/user/IUser";
import BaseController from "./BaseController";

/**
 * This class creates several properties responsible for authentication actions 
 * provided to the user.
 */
export default class AuthenticationController extends BaseController {
    private encryptor: Encryptor;
    private tokenCreator: TokenCreator<IIdentification>;
    private database: IDatabase<IUser>;

    // 30 minutes in seconds.
    protected timeoutTimeInSeconds = 30 * 60;

    constructor(
        database: IDatabase<IUser>,
        encryptor: Encryptor,
        tokenCreator: TokenCreator<IIdentification>
    ) {
        super();

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
            inventory: []
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

        let logs = await userCredentials.validate();

        if (logs.length > 0) {
            return this.sendError(400, res, logs);
        }

        let parameters = new Map([
            ["username", userCredentials.username]
        ]);

        return this.database.Get(parameters).then(user => {
            if (user === null) {
                return this.sendError(404, res, "User could not be found.");
            }

            return this.encryptor.compare(userCredentials.password, user.password).then(result => {
                if (!result) {
                    return this.sendError(403, res, `User credentials are incorrect.`);
                }

                let identification: IIdentification = {
                    username: user.username
                };

                let token = this.tokenCreator.sign(identification, this.timeoutTimeInSeconds);

                return this.sendSuccess(200, res, { accessToken: token });
            }, (error) => this.sendError(400, res, this.getException(error)));
        }, (error) => this.sendError(400, res, this.getException(error)));
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

        let logs = await userCredentials.validate();

        if (logs.length > 0) {
            return this.sendError(400, res, logs);
        }

        let parameters = new Map([
            ["username", userCredentials.username]
        ]);

        return this.database.Get(parameters).then(async user => {
            if (user !== null) {
                return this.sendError(400, res, `User with such username already exists.`);
            }

            let internalUser = this.convertToUser(userCredentials);
            internalUser.password = await this.encryptor.encrypt(internalUser.password);

            return this.database.Create(internalUser).then(createdUser => {
                if (createdUser === null) {
                    return this.sendError(400, res, `User could not be created.`);
                }

                return this.sendSuccess(200, res);
            }, (error) => this.sendError(400, res, this.getException(error)));
        }, (error) => this.sendError(400, res, this.getException(error)))
    }
}
