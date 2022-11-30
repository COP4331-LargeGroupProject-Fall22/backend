import { validate } from "class-validator";

import ISchema from "./ISchema";

export default abstract class Schema implements ISchema {
    async validate(): Promise<{ [type: string]: string; }[]> {
        let validationError = validate(this);

        const errors = await validationError;

        let logs: Array<{ [type: string]: string; }> = [];
        if (errors.length > 0) {
            errors.forEach(error => {
                if (error.constraints !== undefined) {
                    logs.push(error.constraints)
                }

                if (error.children !== undefined) {
                    error.children.forEach(child => {
                        if (child.constraints !== undefined) {
                            logs.push(child.constraints);
                        }
                    });
                }
            });
        }

        return await Promise.resolve(logs);
    }
}
