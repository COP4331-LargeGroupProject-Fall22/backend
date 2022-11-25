import { IsNotEmpty, IsString, validate } from "class-validator";
import ISchema from "../../../ISchema";

export default class SendCodeRequestSchema implements ISchema {
    @IsString()
    @IsNotEmpty()
    username: string;

    constructor(username: string) {
        this.username = username;
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
