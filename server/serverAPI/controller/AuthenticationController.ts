import { Request, Response } from "express";
import { ResponseCodes } from "../../utils/ResponseCodes";

import Encryptor from "../../utils/Encryptor";
import TokenCreator from "../../utils/TokenCreator";
import Random from "../../utils/Random";

import Token from "../model/internal/token/Token";

import UserSchema from "../model/internal/user/UserSchema";
import ConfirmCodeRequestSchema from "../model/external/requests/authentication/ConfirmCodeRequest";
import LoginRequestSchema from "../model/external/requests/authentication/LoginRequest";
import SendCodeRequestSchema from "../model/external/requests/authentication/SendCodeRequest";
import RefreshJWTRequestSchema from "../model/external/requests/authentication/RefreshJWTRequest";
import RegisterRequestSchema from "../model/external/requests/authentication/RegisterRequest";


import IDatabase from "../../database/IDatabase";
import IIdentification from "../model/internal/user/IIdentification";
import IUser from "../model/internal/user/IUser";
import IEmailAPI from "../../emailAPI/IEmailAPI";
import IVerificationCodeTemplate from "../model/internal/email/IVerificationCodeTemplate";

import BaseUserController from "./BaseController/BaseUserController";

import JWTStorage from "../middleware/authentication/JWTStorage";
import UserToken from "../model/internal/userToken/UserToken";

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

        this.encryptor = encryptor;
        this.tokenCreator = tokenCreator;
        this.emailAPI = emailAPI;
    }

    protected parseLoginRequest(req: Request, res: Response): Promise<LoginRequestSchema> {
        let request = new LoginRequestSchema(
            req.body?.username,
            req.body?.password
        );

        return this.verifySchema(request, res);;
    }

    protected parseRegisterRequest(req: Request, res: Response): Promise<RegisterRequestSchema> {
        let request = new RegisterRequestSchema(
            req.body?.firstName,
            req.body?.lastName,
            req.body?.username,
            req.body?.password,
            req.body?.email
        );

        return this.verifySchema(request, res);
    }

    protected parseConfirmCodeRequest(req: Request, res: Response): Promise<ConfirmCodeRequestSchema> {
        let request = new ConfirmCodeRequestSchema(req.body?.username, req.body?.verificationCode);

        return this.verifySchema(request, res);
    }

    protected parseSendCodeRequest(req: Request, res: Response): Promise<SendCodeRequestSchema> {
        let request = new SendCodeRequestSchema(req.body?.username);

        return this.verifySchema(request, res);
    }

    protected parseRefreshJWTRequest(req: Request, res: Response): Promise<RefreshJWTRequestSchema> {
        let request = new RefreshJWTRequestSchema(req.body?.refreshToken);

        return this.verifySchema(request, res);
    }

    protected createToken(identification: IIdentification): UserToken {
        let accessToken = this.tokenCreator.sign(identification, this.accessTokenTimeoutInSeconds);
        let refreshToken = this.tokenCreator.sign(identification, this.refreshTokenTimeoutInSeconds);

        let currentTime = Date.now();

        let userToken = new UserToken(
            new Token(accessToken, currentTime, this.accessTokenTimeoutInSeconds, currentTime + this.accessTokenTimeoutInSeconds * 1000),
            new Token(refreshToken, currentTime, this.refreshTokenTimeoutInSeconds, currentTime + this.refreshTokenTimeoutInSeconds * 1000)
        );

        JWTStorage.getInstance().addJWT(
            identification.username,
            userToken
        );

        return userToken;
    }

    /**
     * Logs client into the server using token from authorization header.
     * 
     * @param req Request parameter that holds information about request.
     * @param res Response parameter that holds information about response.
     */
    login = async (req: Request, res: Response) => {
        let parsedRequest: LoginRequestSchema;
        let user: IUser;

        try {
            parsedRequest = await this.parseLoginRequest(req, res);
            user = await this.requestGet(new Map([["username", parsedRequest.username]]), res);
        } catch (response) {
            return response;
        }

        let result = await this.encryptor.compare(parsedRequest.password, user.password);

        if (!result) {
            return this.send(ResponseCodes.UNAUTHORIZED, res, `User credentials are incorrect.`);
        }

        if (!user.isVerified) {
            return this.send(ResponseCodes.FORBIDDEN, res, "Account is not verified.");
        }

        let token = this.createToken({ username: user.username });

        if (req.query.includeInfo === 'true') {
            return this.send(ResponseCodes.OK, res, {
                token,
                userInfo: this.convertToUserResponse(user)
            });
        }

        user.lastSeen = Date.now();

        try {
            await this.requestUpdate(user.username, user, res);
        } catch (response) {
            return response;
        }

        return this.send(ResponseCodes.OK, res, token);
    }

    confirmVerificationCode = async (req: Request, res: Response) => {
        let parsedRequest: ConfirmCodeRequestSchema;
        let user: IUser;

        try {
            parsedRequest = await this.parseConfirmCodeRequest(req, res);
            user = await this.requestGet(new Map([["username", parsedRequest.username]]), res)
        } catch (response) {
            return response;
        }

        let actualCode = AuthenticationController.verificationCodesMap.get(parsedRequest.username);

        if (actualCode === undefined) {
            return this.send(ResponseCodes.BAD_REQUEST, res, "Verification code is either expired or not issued.");
        }

        if (parsedRequest.code !== actualCode.code) {
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
        let parsedRequest: SendCodeRequestSchema;
        let user: IUser;

        try {
            parsedRequest = await this.parseSendCodeRequest(req, res);
            user = await this.requestGet(new Map([["username", parsedRequest.username]]), res);
        } catch (response) {
            return response;
        }

        let newVerificationCode = Random.getRandomIntInRange(this.minVerificationCode, this.maxVerificationCode);

        try {
            await this.requestGet(new Map([["username", parsedRequest.username]]), res)
        } catch (response) {
            return response;
        }

        let verificationCodeInfo = AuthenticationController.verificationCodesMap.get(parsedRequest.username);

        let verificationCodeTemplate: IVerificationCodeTemplate = {
            verificationCode: newVerificationCode,
            username: parsedRequest.username
        }

        if (verificationCodeInfo !== undefined) {
            // If code has been issued and the number of codes sent is less than max allowed
            // We increment number of attempts and assign existant code to the template
            if (verificationCodeInfo.attempts < this.maxAttemptsPerVerificationCode) {
                verificationCodeInfo = {
                    code: verificationCodeInfo.code,
                    generationTime: verificationCodeInfo.generationTime,
                    attempts: ++verificationCodeInfo.attempts
                };

                verificationCodeTemplate.verificationCode = verificationCodeInfo.code;
            } else {
                // Else we throw a descriptive error and prohibiting user from spaming
                let timeRemaining =
                    this.convertToMinutes(this.verificationCodeLifetimeInMilliseconds - (Date.now() - verificationCodeInfo.generationTime));

                return this.send(ResponseCodes.BAD_REQUEST, res,
                    `Max number of ${this.maxAttemptsPerVerificationCode} attempts has been reached. ` +
                    `Please wait ${timeRemaining} minutes before trying again.`);
            }
        } else {
            // If there are no verification codes in data structure, we create a new one
            verificationCodeInfo = {
                code: newVerificationCode,
                generationTime: Date.now(),
                attempts: 1
            };

            // Each verification code created will self-destruct after specified time
            setTimeout(() => {
                AuthenticationController.verificationCodesMap.delete(parsedRequest.username);
            }, this.verificationCodeLifetimeInMilliseconds).unref();
        }

        // After all procedure on verificationCodeInfo, we update our data structure with changed info
        AuthenticationController.verificationCodesMap.set(
            parsedRequest.username,
            verificationCodeInfo
        );

        return this.emailAPI.SendVerificationCode(
            user.email,
            process.env.OUTBOUND_VERIFICATION_EMAIL,
            verificationCodeTemplate)
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
        let parsedRequest: RefreshJWTRequestSchema;
        let identification: IIdentification;

        try {
            parsedRequest = await this.parseRefreshJWTRequest(req, res);
        } catch (response) {
            return response;
        }

        try {
            identification = this.tokenCreator.verify(parsedRequest.refreshToken);
        } catch (error) {
            return this.send(ResponseCodes.UNAUTHORIZED, res, "Refresh token is invalid.");
        }

        return this.send(ResponseCodes.OK, res, this.createToken({ username: identification.username }));
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
        let parsedRequest: RegisterRequestSchema;
        let userExists: boolean;

        try {
            parsedRequest = await this.parseRegisterRequest(req, res);
            userExists = await this.userExists(parsedRequest.username, res);
        } catch (response) {
            return response;
        }

        if (userExists) {
            return this.send(ResponseCodes.BAD_REQUEST, res, `User with such username already exists.`);
        }

        let internalUser = new UserSchema(
            parsedRequest.firstName,
            parsedRequest.lastName,
            parsedRequest.username,
            parsedRequest.password,
            parsedRequest.email,
            parsedRequest.lastSeen
        );

        internalUser.password = await this.encryptor.encrypt(internalUser.password);

        let createdUser = await this.database.Create(internalUser);

        if (createdUser === null) {
            return this.send(ResponseCodes.BAD_REQUEST, res, `User could not be created.`);
        }

        return this.sendVerificationCode(req, res);
    }
}
