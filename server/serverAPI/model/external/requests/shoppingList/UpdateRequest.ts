import { ValidateNested } from "class-validator";

import IUnit from "../../../internal/unit/IUnit";

import Schema from "../../../Schema";

export default class UpdateRequestSchema extends Schema {
    @ValidateNested()
    quantity: IUnit;

    constructor(
        quantity: IUnit
    ) {
        super();

        this.quantity = quantity;
    }
}
