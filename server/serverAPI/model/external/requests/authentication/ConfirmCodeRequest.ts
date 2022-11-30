import { IsInt, IsNotEmpty, IsPositive, IsString } from "class-validator";

import Schema from "../../../Schema";

export default class ConfirmCodeRequestSchema extends Schema {
    @IsString()
    @IsNotEmpty()
    username: string;
    
    @IsInt()
    @IsPositive()
    code: number;

    constructor(username: string, verificationCode: number) {
        super();

        this.username = username;
        this.code = verificationCode;
    }
}
