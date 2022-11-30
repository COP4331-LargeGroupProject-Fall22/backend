import IInventoryIngredient from "../../../internal/ingredient/IInventoryIngredient";
import IImage from "../../../internal/image/IImage";

import BaseIngredientSchema from "../../../internal/ingredient/BaseIngredientSchema";

import IsType from "../../../../../utils/ClassValidator";

export default class AddRequestSchema extends BaseIngredientSchema implements IInventoryIngredient {
    @IsType(['null', 'positiveInt'])
    expirationDate: number | null;

    constructor(
        id: number,
        name: string,
        category: string,
        image: IImage,
        expirationDate: number | null = null
    ) {
        super(id, name, category, image);
        this.expirationDate = expirationDate;
    }
}
