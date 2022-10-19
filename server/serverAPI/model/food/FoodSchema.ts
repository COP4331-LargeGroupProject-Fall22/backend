import { IsArray, IsInt, IsNotEmpty, IsObject, IsPositive, IsString } from "class-validator";
import INutrient from "../nutrients/INutrient";
import IUnit from "../unit/IUnit";
import IFood from "./IFood";

/**
 * This class implements IFood interface and provides several built-in validations of its own properties.
 */
export default class FoodSchema implements IFood {
    @IsNotEmpty()
    @IsString()
    readonly name: string;

    @IsString()
    @IsNotEmpty()
    readonly category: string;

    @IsInt()
    @IsNotEmpty()
    @IsPositive()
    readonly quantity: number;

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
        quantity: number,
        packageWeight: IUnit[],
        nutrients: INutrient[],
        expirationDate: number
    ) {
        this.name = name;
        this.category = category;
        this.quantity = quantity;
        this.packageWeight = packageWeight;
        this.nutrients = nutrients;
        this.expirationDate = expirationDate;
    }
}
