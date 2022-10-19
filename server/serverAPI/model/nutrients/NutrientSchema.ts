import { IsNotEmpty, IsNumber, IsObject, IsPositive, IsString } from "class-validator";
import IUnit from "../unit/IUnit";
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

    @IsObject()
    @IsNotEmpty()
    readonly unit: IUnit;

    @IsNumber()
    @IsPositive()
    @IsNotEmpty()
    readonly percentOfDaily: number;

    constructor(
        name: string,
        value: number,
        unit: IUnit,
        percentOfDaily: number
    ) {
        this.name = name;
        this.value = value;
        this.unit = unit;
        this.percentOfDaily = percentOfDaily;
    }
}
