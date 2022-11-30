import { IsNotEmpty, IsString } from "class-validator";

import Schema from "../../../Schema";

export default class SendCodeRequestSchema extends Schema {
    @IsString()
    @IsNotEmpty()
    username: string;

    constructor(username: string) {
        super();

        this.username = username;
    }
}
