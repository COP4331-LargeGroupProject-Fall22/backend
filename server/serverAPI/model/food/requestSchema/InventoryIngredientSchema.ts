import { IsNotEmpty, IsNumber, IsPositive, IsString, validate, ValidateNested } from "class-validator";
import ISchema from "../../ISchema";
import INutrient from "../../nutrients/INutrient";
import IInventoryIngredient from "../IInventoryIngredient";

export default class InventoryIngredientSchema implements IInventoryIngredient, ISchema {
    @IsNumber()
    @IsPositive()
    expirationDate: number;

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


    constructor(
        id: number,
        name: string,
        category: string,
        nutrients: INutrient[],
        expirationDate: number
    ) {
        this.id = id;
        this.name = name;
        this.category = category;
        this.nutrients = nutrients;
        this.expirationDate = expirationDate;
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
