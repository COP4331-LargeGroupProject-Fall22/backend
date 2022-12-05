import { IsEmail } from "class-validator";

import Schema from "../../../Schema";

export default class RequestPasswordResetRequestSchema extends Schema {
    @IsEmail()
    email: string;

    constructor(
        email: string
    ) {
        super();

        this.email = email;
    }
}
