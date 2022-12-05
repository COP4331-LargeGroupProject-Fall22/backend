import { IsNotEmpty, IsString } from "class-validator";
import IsType from "../../../../utils/ClassValidator";
import Schema from "../../Schema";

import IUnit from "./IUnit";

/**
 * This class implements IUnit interface and provides several built-in validations of its own properties.
 */
export default class UnitSchema extends Schema implements IUnit {
    @IsString()
    unit: string;

    @IsType(['positiveNumber'])
    value: number;
    
    constructor(
        unit: string,
        value: number
    ) {
        super();

        this.unit = unit;
        this.value = value;
    }
}
