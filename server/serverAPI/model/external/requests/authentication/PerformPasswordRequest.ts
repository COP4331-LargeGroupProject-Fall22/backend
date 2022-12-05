import { IsEmail, IsString } from "class-validator";
import IsType from "../../../../../utils/ClassValidator";

import Schema from "../../../Schema";

export default class PerformPasswordResetRequestSchema extends Schema {
    @IsEmail()
    email: string;

    @IsString()
    password: string;

    @IsType(['positiveInt'])
    code: number;

    constructor(
        email: string,
        password: string,
        code: number
    ) {
        super();

        this.email = email;
        this.code = code;
        this.password = password;
    }
}
