import { IsInt, IsNotEmpty, IsPositive, IsString, validate } from "class-validator";
import ISchema from "../ISchema";
import IEmailVerificationTemplate from "./IEmailVerificationTemplate";

export default class EmailVerificationTemplateSchema implements IEmailVerificationTemplate, ISchema {
    @IsString()
    @IsNotEmpty()
    username: string;
    
    @IsInt()
    @IsPositive()
    confirmationCode: number;

    constructor(username: string, verificationCode: number) {
        this.username = username;
        this.confirmationCode = verificationCode;
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
