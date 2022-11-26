import Token from "../token/Token";

export default class UserToken {
    accessToken: Token;
    refreshToken: Token;

    constructor(accessToken: Token, refreshToken: Token) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
    }
}
