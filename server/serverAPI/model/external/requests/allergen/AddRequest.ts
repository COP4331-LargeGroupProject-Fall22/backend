import { IsInt, IsNotEmpty, IsPositive, IsString, validate, ValidateNested } from "class-validator";
import IImage from "../../../internal/image/IImage";
import ISchema from "../../../ISchema";
import IBaseIngredient from "../../../internal/ingredient/IBaseIngredient";

export default class AddRequestSchema implements IBaseIngredient, ISchema {
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
        this.id = id;
        this.image = image
        this.name = name;
        this.category = category;
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
