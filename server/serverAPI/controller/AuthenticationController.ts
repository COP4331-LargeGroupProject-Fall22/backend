import { Request, Response } from "express";
import IDatabase from "../../database/IDatabase";
import Encryptor from "../../utils/Encryptor";
import ResponseFormatter from "../../utils/ResponseFormatter";
import { ResponseTypes } from "../../utils/ResponseTypes";
import UserLoginSchema from "../model/user/requestSchema/UserLoginSchema";
import UserRegistrationSchema from "../model/user/requestSchema/UserRegistrationSchema";
import TokenCreator from "../../utils/TokenCreator";
import IIdentification from "../model/user/IIdentification";
import IUser from "../model/user/IUser";
import BaseUserController from "./BaseUserController";

/**
 * This class creates several properties responsible for authentication actions 
 * provided to the user.
 */
export default class AuthenticationController extends BaseUserController {
    private encryptor: Encryptor;
    private tokenCreator: TokenCreator<IIdentification>;

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

    convertToUser(userCredentials: UserRegistrationSchema): IUser {
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
     * Lets client to login into the server using token from authorization header.
     * Upon successful login operation, this handler will redirect user to the /api/user route.
     * 
     * @param req Request parameter that holds information about request
     * @param res Response parameter that holds information about response
     */
    login = async (req: Request, res: Response) => {
        let userCredentials = new UserLoginSchema(
            req.body?.username,
            req.body?.password
        );

        let logs = await userCredentials.validate();

        if (logs.length > 0) {
            return res.status(400)
                .json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, logs));
        }

        let parameters = new Map([
            ["username", userCredentials.username]
        ]);

        return this.database.Get(parameters).then(user => {
            if (user === null) {
                return res.status(403)
                    .json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, `User doesn't exist.`));
            }

            return this.encryptor.compare(userCredentials.password, user.password).then(result => {
                if (!result) {
                    return res.status(403)
                        .json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, `User credentials are incorrect.`));
                }

                let identification: IIdentification = {
                    username: user.username
                };

                let token = this.tokenCreator.sign(identification, 30 * 60);

                return res.status(200)
                    .json(ResponseFormatter.formatAsJSON(ResponseTypes.SUCCESS, token));
            }, (error) => {
                return res.status(400)
                    .json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, this.getException(error)));
            });
        }, (error) => {
            return res.status(400)
                .json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, this.getException(error)));
        });
    }

    /**
     * Let's client to register their account on the server.
     * Client is expected to provide all required information and token in authorization header.
     * Upon successful register operation, this handler will return full information about registered user. 
     * 
     * @param req Request parameter that holds information about request
     * @param res Response parameter that holds information about response
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
            return res.status(400)
                .json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, logs));
        }

        let parameters = new Map([
            ["username", userCredentials.username]
        ]);

        return this.database.Get(parameters).then(async user => {
            if (user !== null) {
                return res.status(400)
                    .json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, `User with such username already exists.`));
            }

            let internalUser = this.convertToUser(userCredentials);
            internalUser.password = await this.encryptor.encrypt(internalUser.password);

            return this.database.Create(internalUser).then(createdUser => {
                if (createdUser === null) {
                    return res.status(400)
                        .json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, "Couldn't create user."));
                }

                return res.status(200)
                    .json(ResponseFormatter.formatAsJSON(ResponseTypes.SUCCESS));
            }, (error) => {
                return res.status(400).
                    json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, this.getException(error)));
            });
        }, (error) => {
            return res.status(400)
                .json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, this.getException(error)));
        });
    }
}
