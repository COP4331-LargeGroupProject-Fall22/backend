import { validate, ValidateNested } from "class-validator";

import ISchema from "../../../ISchema";
import IUnit from "../../../internal/unit/IUnit";

export default class UpdateRequestSchema implements ISchema {
    @ValidateNested()
    quantity: IUnit;

    constructor(
        quantity: IUnit
    ) {
        this.quantity = quantity;
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
