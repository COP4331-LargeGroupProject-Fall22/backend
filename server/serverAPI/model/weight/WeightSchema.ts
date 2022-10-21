import { IsNotEmpty, IsNumber, IsPositive } from "class-validator";
import IWeight from "./IWeight";
import { WeightUnits } from "./WeightUnits";

/**
 * This class implements IWeight interface and provides several built-in validations of its own properties.
 */
export default class WeightSchema implements IWeight {
    
    @IsNotEmpty()
    readonly unit: WeightUnits;
    
    @IsNumber()
    @IsPositive()
    readonly value: number;

    constructor(
        unit: WeightUnits,
        value: number
    ) {
        this.unit = unit;
        this.value = value;
    }
}
