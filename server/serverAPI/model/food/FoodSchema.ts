import { IsArray, IsInt, IsNotEmpty, IsObject, IsPositive, IsString } from "class-validator";
import INutrient from "../nutrients/INutrient";
import IWeight from "../weight/IWeight";
import IFood from "./IFood";

/**
 * This class implements IFood interface and provides several built-in validations of its own properties.
 */
export default class FoodSchema implements IFood {
    @IsNotEmpty()
    @IsString()
    readonly name: string;

    @IsString()
    readonly brandName: string;

    @IsInt()
    @IsNotEmpty()
    @IsPositive()
    readonly quantity: number;

    @IsNotEmpty()
    @IsObject()
    readonly packageWeight: IWeight;

    @IsArray()
    @IsNotEmpty()
    readonly nutrients: INutrient[];

    @IsNotEmpty()
    @IsInt()
    @IsPositive()
    readonly expirationDate: number;

    constructor(
        name: string,
        brandName: string,
        quantity: number,
        packageWeight: IWeight,
        nutrients: INutrient[],
        expirationDate: number
    ) {
        this.name = name;
        this.brandName = brandName;
        this.quantity = quantity;
        this.packageWeight = packageWeight;
        this.nutrients = nutrients;
        this.expirationDate = expirationDate;
    }
}