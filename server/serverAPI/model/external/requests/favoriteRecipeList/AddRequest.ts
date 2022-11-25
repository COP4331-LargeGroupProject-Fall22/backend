import { IsDefined, IsInt, IsNotEmpty, IsPositive, IsString, validate, ValidateNested } from "class-validator";
import ImageSchema from "../../../internal/image/requestSchema/ImageSchema";
import IIngredient from "../../../internal/ingredient/IIngredient";
import ISchema from "../../../ISchema";
import IBaseRecipe from "../../../internal/recipe/IBaseRecipe";

export default class AddRequestSchema implements IBaseRecipe, ISchema {
    @IsInt()
    @IsPositive()
    id: number;

    @IsString()
    @IsNotEmpty()
    name: string;
    
    @IsDefined()
    @ValidateNested()
    image: ImageSchema;

    ingredients: IIngredient[];

    constructor(id: number, name: string, image: ImageSchema, ingredients: IIngredient[]) {
        this.id = id;
        this.name = name;
        this.image = image;
        this.ingredients = ingredients;
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
