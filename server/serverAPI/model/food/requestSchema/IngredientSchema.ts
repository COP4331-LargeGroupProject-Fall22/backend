import { IsArray, IsInt, IsNotEmpty, IsPositive, IsString, validate, ValidateNested } from "class-validator";
import ISchema from "../../ISchema";
import IBaseIngredient from "../IBaseIngredient";

export default class BaseIngredientSchema implements IBaseIngredient, ISchema {
    @IsInt()
    @IsPositive()
    id: number;

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    category: string;

    @IsArray()
    quantityUnits: string[];

    constructor(
        id: number,
        name: string,
        category: string,
        quantityUnits: string[]
    ) {
        this.id = id;
        this.name = name;
        this.category = category;
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