import { IsArray, IsNotEmpty,IsString } from "class-validator";
import INutrient from "../nutrients/INutrient";
import IFood from "./IFood";

/**
 * This class implements IFood interface and provides several built-in validations of its own properties.
 */
export default class FoodSchema implements IFood {
    readonly id: number;

    @IsNotEmpty()
    @IsString()
    readonly name: string;

    readonly category: string;

    @IsArray()
    @IsNotEmpty()
    readonly nutrients: INutrient[];

    constructor(
        id: number,
        name: string,
        category: string,
        nutrients: INutrient[],
    ) {
        this.id = id;
        this.name = name;
        this.category = category;
        this.nutrients = nutrients;
    }
}
