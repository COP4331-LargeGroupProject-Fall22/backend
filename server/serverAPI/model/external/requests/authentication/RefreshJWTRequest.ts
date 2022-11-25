import { IsNotEmpty, IsString, validate } from "class-validator";
import ISchema from "../../../ISchema";

export default class RefreshJWTRequestSchema implements ISchema {
    @IsString()
    @IsNotEmpty()
    refreshToken: string;

    constructor(refreshToken: string) {
        this.refreshToken = refreshToken;
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
