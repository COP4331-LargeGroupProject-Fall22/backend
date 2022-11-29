import { IsArray, ValidateNested } from "class-validator";

import IImage from "../../../internal/image/IImage";
import IUnit from "../../../internal/unit/IUnit";
import IShoppingIngredient from "../../../internal/ingredient/IShoppingIngredient";
import IPrice from "../../../internal/money/IPrice";

import BaseIngredientSchema from "../../../internal/ingredient/BaseIngredientSchema";

export default class AddRequestSchema extends BaseIngredientSchema implements IShoppingIngredient {
    itemID?: string;

    @ValidateNested()
    quantity: IUnit;

    @IsArray()
    quantityUnits: string[];

    recipeID?: number;

    recipeName?: string;

    price?: IPrice;
    
    constructor(
        id: number,
        name: string,
        category: string,
        quantityUnits: string[],
        quantity: IUnit,
        image: IImage,
        price: IPrice,
        recipeID?: number,
        recipeName?: string
    ) {
        super(id, name, category, image);
        
        this.quantityUnits = quantityUnits;
        this.quantity = quantity;
        this.recipeID = recipeID;
        this.recipeName = recipeName;
        this.price = price;
    }
}
