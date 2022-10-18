import { IsNotEmpty, IsNumber, IsPositive, IsString } from "class-validator";
import INutrient from "./INutrient";

/**
 * This class implements INutrient interface and provides several built-in validations of its own properties.
 */
export default class NutrientSchema implements INutrient {
    @IsString()
    @IsNotEmpty()
    readonly name: string;

    @IsNumber()
    @IsNotEmpty()
    @IsPositive()
    readonly value: number;

    constructor(
        name: string,
        value: number
    ) {
        this.name = name;
        this.value = value;
    }
}
