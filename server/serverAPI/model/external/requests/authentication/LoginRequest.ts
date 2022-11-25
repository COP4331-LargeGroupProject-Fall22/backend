import { IsNotEmpty, IsString, validate } from "class-validator";
import ISchema from "../../../ISchema";
import ICredentials from "../../../internal/user/ICredentials";

export default class LoginRequestSchema implements ICredentials, ISchema {
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
        this.username = username;
        this.password = password;
    }

    async validate(): Promise<{ [type: string]: string; }[]> {
        let validationError = validate(this);

        const errors = await validationError;

        let logs: Array<{ [type: string]: string; }> = [];
        if (errors.length > 0) {
            errors.forEach(error => logs.push(error.constraints!));
        }

        return await Promise.resolve(logs);
    }
}
