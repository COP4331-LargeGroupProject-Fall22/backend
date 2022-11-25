import { validate } from "class-validator";
import IsType from "../../../../../utils/ClassValidator";
import ISchema from "../../../ISchema";

export default class UpdateRequestSchema implements ISchema {
    @IsType(['null', 'positiveInt'])
    expirationDate: number | null;

    constructor(
        expirationDate: number | null = null
    ) {
        this.expirationDate = expirationDate;
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
