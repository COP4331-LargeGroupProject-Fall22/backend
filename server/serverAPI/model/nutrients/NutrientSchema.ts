import { IsNotEmpty, IsNumber, IsObject, IsPositive, IsString, ValidateNested } from "class-validator";
import IUnit from "../unit/IUnit";
import INutrient from "./INutrient";

/**
 * This class implements INutrient interface and provides several built-in validations of its own properties.
 */
export default class NutrientSchema implements INutrient {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsObject()
    @IsNotEmpty()
    @ValidateNested()
    unit: IUnit;

    @IsNumber()
    @IsPositive()
    @IsNotEmpty()
    percentOfDaily: number;

    constructor(
        name: string,
        unit: IUnit,
        percentOfDaily: number
    ) {
        this.name = name;
        this.unit = unit;
        this.percentOfDaily = percentOfDaily;
    }
}
