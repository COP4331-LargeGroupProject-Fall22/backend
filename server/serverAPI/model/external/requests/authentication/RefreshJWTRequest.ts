import { IsNotEmpty, IsString } from "class-validator";

import Schema from "../../../Schema";

export default class RefreshJWTRequestSchema extends Schema {
    @IsString()
    @IsNotEmpty()
    refreshToken: string;

    constructor(refreshToken: string) {
        super();

        this.refreshToken = refreshToken;
    }
}
