import { IsBase64, validate } from "class-validator";
import ISchema from "../../../ISchema";

export default class AddRequestSchema implements ISchema {
    @IsBase64()
    imgAsBase64: string

    constructor(imgAsBase64: string) {
        this.imgAsBase64 = imgAsBase64;
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