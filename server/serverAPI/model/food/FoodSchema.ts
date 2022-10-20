import { IsArray, IsInt, IsNotEmpty, IsObject, IsPositive, IsString } from "class-validator";
import INutrient from "../nutrients/INutrient";
import IUnit from "../unit/IUnit";
import IFood from "./IFood";

/**
 * This class implements IFood interface and provides several built-in validations of its own properties.
 */
export default class FoodSchema implements IFood {
    readonly id: number;

    @IsNotEmpty()
    @IsString()
    readonly name: string;

    @IsString()
    @IsNotEmpty()
    readonly category: string;

    @IsNotEmpty()
    @IsObject()
    readonly packageWeight: IUnit[];

    @IsArray()
    @IsNotEmpty()
    readonly nutrients: INutrient[];

    @IsNotEmpty()
    @IsInt()
    @IsPositive()
    readonly expirationDate: number;

    constructor(
        name: string,
        category: string,
        packageWeight: IUnit[],
        nutrients: INutrient[],
        expirationDate: number
    ) {
        this.id = -1;
        this.name = name;
        this.category = category;
        this.packageWeight = packageWeight;
        this.nutrients = nutrients;
        this.expirationDate = expirationDate;
    }
}
