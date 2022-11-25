import { IsInt, IsNotEmpty, IsPositive, IsString, validate } from "class-validator";
import ISchema from "../../../ISchema";

export default class ConfirmCodeRequestSchema implements ISchema {
    @IsString()
    @IsNotEmpty()
    username: string;
    
    @IsInt()
    @IsPositive()
    code: number;

    constructor(username: string, verificationCode: number) {
        this.username = username;
        this.code = verificationCode;
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
