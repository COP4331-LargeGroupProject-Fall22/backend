import { IsNotEmpty, IsNumber, IsPositive, IsString, validate } from "class-validator";
import ISchema from "../ISchema";
import IUnit from "./IUnit";

/**
 * This class implements IUnit interface and provides several built-in validations of its own properties.
 */
export default class UnitSchema implements IUnit, ISchema {
    @IsNotEmpty()
    @IsString()
    unit: string;

    @IsNotEmpty()
    @IsPositive()
    @IsNumber()
    value: number;
    
    constructor(
        unit: string,
        value: number
    ) {
        this.unit = unit;
        this.value = value;
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
