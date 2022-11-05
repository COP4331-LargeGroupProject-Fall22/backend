import { IsArray, IsNotEmpty, IsNumber, IsObject, IsPositive, IsString, validate, ValidateNested } from "class-validator";
import ISchema from "../../ISchema";
import INutrient from "../../nutrients/INutrient";
import IUnit from "../../unit/IUnit";
import IIngredient from "../IIngredient";

export default class IngredientSchema implements IIngredient, ISchema {
    @ValidateNested()
    nutrients: INutrient[];

    @IsNumber()
    @IsPositive()
    id: number;

    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsString()
    category: string;

    @IsArray()
    quantityUnits: string[];

    constructor(
        id: number,
        name: string,
        category: string,
        nutrients: INutrient[],
        quantityUnits: string[],
    ) {
        this.id = id;
        this.name = name;
        this.category = category;
        this.nutrients = nutrients;
        this.quantityUnits = quantityUnits;
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
