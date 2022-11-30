import { IsInt, IsNotEmpty, IsPositive, IsString, ValidateNested } from "class-validator";

import IImage from "../image/IImage";
import IBaseIngredient from "./IBaseIngredient";

import Schema from "../../Schema";

export default class BaseIngredientSchema extends Schema implements IBaseIngredient {
    @IsInt()
    @IsPositive()
    id: number;

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    category: string;

    @ValidateNested()
    image: IImage;

    constructor(
        id: number,
        name: string,
        category: string,
        image: IImage
    ) {
        super();

        this.id = id;
        this.image = image
        this.name = name;
        this.category = category;
    }
}
