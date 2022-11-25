import { IsArray, ValidateNested } from "class-validator";

import IImage from "../../../internal/image/IImage";
import IUnit from "../../../internal/unit/IUnit";
import IShoppingIngredient from "../../../internal/ingredient/IShoppingIngredient";

import BaseIngredientSchema from "../../../internal/ingredient/BaseIngredientSchema";

export default class AddRequestSchema extends BaseIngredientSchema implements IShoppingIngredient {
    itemID?: string;

    @ValidateNested()
    quantity: IUnit;

    @IsArray()
    quantityUnits: string[];

    recipeID?: number;

    constructor(
        id: number,
        name: string,
        category: string,
        quantityUnits: string[],
        quantity: IUnit,
        image: IImage,
        recipeID?: number
    ) {
        super(id, name, category, image);
        
        this.quantityUnits = quantityUnits;
        this.quantity = quantity;
        this.recipeID = recipeID;
    }
}
