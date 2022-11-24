import { IsArray, IsDefined, IsNotEmptyObject, IsObject, ValidateNested } from "class-validator";
import IImage from "../../image/IImage";
import IUnit from "../../unit/IUnit";
import IShoppingIngredient from "../IShoppingIngredient";
import BaseIngredientSchema from "./BaseIngredientSchema";

export default class ShoppingIngredientSchema extends BaseIngredientSchema implements IShoppingIngredient {
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
