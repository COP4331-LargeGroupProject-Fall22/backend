import { IsNotEmpty, IsString } from "class-validator";

import ICredentials from "../../../internal/user/ICredentials";

import Schema from "../../../Schema";

export default class LoginRequestSchema extends Schema implements ICredentials {
    @IsString()
    @IsNotEmpty()
    username: string;

    @IsString()
    @IsNotEmpty()
    password: string;

    constructor(
        username: string,
        password: string
    ) {
        super();

        this.username = username;
        this.password = password;
    }
}
