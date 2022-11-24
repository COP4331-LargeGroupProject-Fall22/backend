import { Request, Response } from "express";
import { ResponseCodes } from "../../utils/ResponseCodes";

import Encryptor from "../../utils/Encryptor";
import TokenCreator from "../../utils/TokenCreator";
import Random from "../../utils/Random";

import Token from "../model/token/Token";
import UserLoginSchema from "../model/user/requestSchema/UserLoginSchema";
import UserRegistrationSchema from "../model/user/requestSchema/UserRegistrationSchema";
import EmailVerificationTemplateSchema from "../model/emailVerification/EmailVerificationTemplateSchema";
import UserSchema from "../model/user/UserSchema";

import IDatabase from "../../database/IDatabase";
import IIdentification from "../model/user/IIdentification";
import IUser from "../model/user/IUser";
import IEmailAPI from "../../emailAPI/IEmailAPI";

import BaseUserController from "./BaseController/BaseUserController";

import JWTStorage from "../middleware/authentication/JWTStorage";

/**
 * This class creates several properties responsible for authentication actions 
 * provided to the user.
 */
export default class AuthenticationController extends BaseUserController {
    private encryptor: Encryptor;
    private tokenCreator: TokenCreator<IIdentification>;
    private emailAPI: IEmailAPI;

    protected static verificationCodesMap: Map<string, { code: number, generationTime: number, attempts: number }> = new Map();
    protected verificationCodeLifetimeInMilliseconds = 5 * 60 * 1000;
    protected maxAttemptsPerVerificationCode = 3;

    protected accessTokenTimeoutInSeconds = 15 * 60;
    protected refreshTokenTimeoutInSeconds = 24 * 60 * 60;

    protected minVerificationCode = 100000;
    protected maxVerificationCode = 999999;

    constructor(
        database: IDatabase<IUser>,
        emailAPI: IEmailAPI,
        encryptor: Encryptor,
        tokenCreator: TokenCreator<IIdentification>
    ) {
        super(database);

        this.database = database;
        this.encryptor = encryptor;
        this.tokenCreator = tokenCreator;
        this.emailAPI = emailAPI;
    }

    private convertToUser(userCredentials: UserRegistrationSchema): IUser {
        return new UserSchema(
            userCredentials.firstName,
            userCredentials.lastName,
            userCredentials.username,
            userCredentials.password,
            userCredentials.email,
            userCredentials.lastSeen
        );
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

        let user: IUser;

        try {
            userCredentials = await this.verifySchema(userCredentials, res);
            user = await this.requestGet(new Map([["username", userCredentials.username]]), res);
        } catch (response) {
            return response;
        }

        let result = await this.encryptor.compare(userCredentials.password, user.password);

        if (!result) {
            return this.send(ResponseCodes.UNAUTHORIZED, res, `User credentials are incorrect.`);
        }

        let identification: IIdentification = {
            username: user.username
        };

        if (!user.isVerified) {
            return this.send(ResponseCodes.FORBIDDEN, res, "Account is not verified.");
        }

        let accessToken = this.tokenCreator.sign(identification, this.accessTokenTimeoutInSeconds);
        let refreshToken = this.tokenCreator.sign(identification, this.refreshTokenTimeoutInSeconds);

        JWTStorage.getInstance().addJWT(
            userCredentials.username,
            new Token(accessToken, refreshToken)
        );

        if (req.query.includeInfo === 'true') {
            return this.send(ResponseCodes.OK, res, {
                accessToken: accessToken,
                refreshToken: refreshToken,
                userInfo: this.convertToUserResponse(user)
            });
        }

        return this.send(ResponseCodes.OK, res, {
            accessToken: accessToken,
            refreshToken: refreshToken
        });
    }

    confirmVerificationCode = async (req: Request, res: Response) => {
        let username = req.body?.username;
        let inputCode = req.body?.verificationCode;

        let actualCode = AuthenticationController.verificationCodesMap.get(username);

        let user: IUser;
        try {
            user = await this.requestGet(new Map([["username", username]]), res)
        } catch (response) {
            return response;
        }

        if (actualCode === undefined) {
            return this.send(ResponseCodes.BAD_REQUEST, res, "Verification code is either expired or not issued.");
        }

        if (Number.parseInt(inputCode) !== actualCode.code) {
            return this.send(ResponseCodes.BAD_REQUEST, res, "Verification code is invalid.");
        }

        user.isVerified = true;

        try {
            await this.requestUpdate(user.username, user, res);
        } catch (response) {
            return response;
        }

        return this.send(ResponseCodes.OK, res, "Account has been verified.");
    }

    private convertToMinutes(timeInMilliseconds: number): number {
        return Math.ceil(timeInMilliseconds / 1000 / 60)
    }

    sendVerificationCode = async (req: Request, res: Response) => {
        let email = "";
        let username = req.body?.username;

        let user: IUser;

        try {
            user = await this.requestGet(new Map([["username", username]]), res);
        } catch (response) {
            return response;
        }

        email = user.email;

        let verificationCode = Random.getRandomIntInRange(this.minVerificationCode, this.maxVerificationCode);

        let emailVerificationSchema = new EmailVerificationTemplateSchema(
            username,
            verificationCode
        );

        try {
            await this.verifySchema(emailVerificationSchema, res);
            await this.requestGet(new Map([["username", username]]), res)
        } catch (response) {
            return response;
        }

        let verificationInfo = AuthenticationController.verificationCodesMap.get(username);

        if (verificationInfo !== undefined) {
            if (verificationInfo.attempts < this.maxAttemptsPerVerificationCode) {
                verificationInfo = {
                    code: verificationInfo.code,
                    generationTime: verificationInfo.generationTime,
                    attempts: ++verificationInfo.attempts
                };

                emailVerificationSchema.confirmationCode = verificationInfo.code;
            } else {
                let timeRemaining =
                    this.convertToMinutes(this.verificationCodeLifetimeInMilliseconds - (Date.now() - verificationInfo.generationTime));

                return this.send(ResponseCodes.BAD_REQUEST, res,
                    `Max number of ${this.maxAttemptsPerVerificationCode} attempts has been reached. ` +
                    `Please wait ${timeRemaining} minutes before trying again.`);
            }
        } else {
            verificationInfo = {
                code: verificationCode,
                generationTime: Date.now(),
                attempts: 1
            };

            setTimeout(() => {
                AuthenticationController.verificationCodesMap.delete(username);
            }, this.verificationCodeLifetimeInMilliseconds);
        }

        AuthenticationController.verificationCodesMap.set(
            username,
            verificationInfo
        );

        return this.emailAPI.SendVerificationCode(
            email,
            process.env.OUTBOUND_VERIFICATION_EMAIL,
            emailVerificationSchema)
            .then(() => this.send(ResponseCodes.OK, res, "Verification code has been sent."))
            .catch((error) => this.send(ResponseCodes.BAD_REQUEST, res, error));
    }

    /**
     * Refreshes client's JWT tokens when correct refresh token is provided.
     * 
     * @param req Request parameter that holds information about request.
     * @param res Response parameter that holds information about response.
     */
    refreshJWT = async (req: Request, res: Response) => {
        try {
            let identification = this.tokenCreator.verify(req.body.refreshToken);

            let accessToken = this.tokenCreator.sign({ username: identification.username }, this.accessTokenTimeoutInSeconds);
            let refreshToken = this.tokenCreator.sign({ username: identification.username }, this.refreshTokenTimeoutInSeconds);

            JWTStorage.getInstance().addJWT(
                identification.username,
                new Token(accessToken, refreshToken)
            );

            return this.send(ResponseCodes.OK, res, {
                accessToken: accessToken,
                refreshToken: refreshToken
            });
        } catch (error) {
            return this.send(ResponseCodes.UNAUTHORIZED, res, "Refresh token is invalid.");
        }
    }

    /**
     * Logs client out from the server. All JWT tokens related to the client becomes invalid.
     * 
     * @param req Request parameter that holds information about request.
     * @param res Response parameter that holds information about response.
     */
    logout = async (req: Request, res: Response) => {
        try {
            JWTStorage.getInstance().deleteJWT(req.serverUser.username);
            return this.send(ResponseCodes.OK, res);
        } catch (error) {
            return this.send(ResponseCodes.BAD_REQUEST, res, "Could not perform logout operation.");
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
            req.body?.password,
            req.body?.email
        );

        let userExists: boolean;

        try {
            userCredentials = await this.verifySchema(userCredentials, res);
            userExists = await this.userExists(userCredentials.username, res);
        } catch (response) {
            return response;
        }

        if (userExists) {
            return this.send(ResponseCodes.BAD_REQUEST, res, `User with such username already exists.`);
        }

        let internalUser = this.convertToUser(userCredentials);
        internalUser.password = await this.encryptor.encrypt(internalUser.password);

        let createdUser = await this.database.Create(internalUser);
        
        if (createdUser === null) {
            return this.send(ResponseCodes.BAD_REQUEST, res, `User could not be created.`);
        }

        return this.sendVerificationCode(req, res);
    }
}
