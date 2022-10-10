import { Blob } from "buffer";
import { validate } from "class-validator";

export class Validator<Type extends object> {
    async validate(object: Type): Promise<Array<{ [type: string]: string }>> {
        let validationError = validate(object);

        return validationError.then(errors => {
            let logs: Array<{ [type: string]: string }> = [];

            if (errors.length > 0)
                errors.forEach(error => logs.push(error.constraints!));

            return Promise.resolve(logs);
        });
    }

    async validateObjectId(id: string): Promise<Array<{ [type: string]: string }>> {
        let size = new Blob([id]).size;

        let logs: Array<{ [type: string]: string }> = [];
        
        if (size === 0)
            logs.push({ isNotEmpty: "12 byte string should not be empty" });
        else if (size !== 12 && id.length !== 24)
            logs.push({ isNot12Byte: `${id} must be a 12 byte string or has 24 hex characters or be an integer`});

        return Promise.resolve(logs);
    }
}
