import { IsDefined, IsInt, IsNotEmpty, IsPositive, IsString, validate, ValidateNested } from "class-validator";
import IImage from "../../image/IImage";
import ImageSchema from "../../image/requestSchema/ImageSchema";
import ISchema from "../../ISchema";
import IBaseRecipe from "../IBaseRecipe";

export default class BaseRecipeSchema implements IBaseRecipe, ISchema {
    @IsInt()
    @IsPositive()
    id: number;

    @IsString()
    @IsNotEmpty()
    name: string;
    
    @IsDefined()
    @ValidateNested()
    image: ImageSchema;

    constructor(id: number, name: string, image: ImageSchema) {
        this.id = id;
        this.name = name;
        this.image = image;
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
