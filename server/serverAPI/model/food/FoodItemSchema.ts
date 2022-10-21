import { IsArray, IsNotEmpty, IsNumber, IsPositive, IsString, ValidateNested } from "class-validator";
import INutrient from "../nutrients/INutrient";
import IFoodItem from "./IFoodItem";

export default class FoodItemSchema implements IFoodItem {
    @IsNumber()
    @IsPositive()
    @IsNotEmpty()
    readonly expirationDate: number;

    @IsNumber()
    @IsPositive()
    @IsNotEmpty()
    readonly id: number;

    @IsString()
    @IsNotEmpty()
    readonly name: string;

    @IsString()
    @IsNotEmpty()
    readonly category: string;

    @IsArray()
    @ValidateNested()
    readonly nutrients: INutrient[];
    
    constructor(
        id: number,
        name: string,
        category: string,
        nutrients: INutrient[],
        expirationDate: number
    ) {
        this.expirationDate = expirationDate;
        this.id = id;
        this.name = name;
        this.nutrients = nutrients;
        this.category = category;
    }
}
