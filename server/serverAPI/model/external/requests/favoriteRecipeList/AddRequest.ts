import { IsDefined, IsInt, IsNotEmpty, IsPositive, IsString, ValidateNested } from "class-validator";

import IIngredient from "../../../internal/ingredient/IIngredient";
import IBaseRecipe from "../../../internal/recipe/IBaseRecipe";
import IBaseIngredient from "../../../internal/ingredient/IBaseIngredient";

import Schema from "../../../Schema";
import IImage from "../../../internal/image/IImage";

export default class AddRequestSchema extends Schema implements IBaseRecipe<IBaseIngredient> {
    @IsInt()
    @IsPositive()
    id: number;

    @IsString()
    @IsNotEmpty()
    name: string;
    
    @IsDefined()
    @ValidateNested()
    image: IImage;

    ingredients: IIngredient[];

    constructor(id: number, name: string, image: IImage, ingredients: IIngredient[]) {
        super();

        this.id = id;
        this.name = name;
        this.image = image;
        this.ingredients = ingredients;
    }
}
