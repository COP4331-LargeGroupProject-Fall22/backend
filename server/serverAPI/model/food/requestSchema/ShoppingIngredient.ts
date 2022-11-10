import { validate, ValidateNested } from "class-validator";
import INutrient from "../../nutrients/INutrient";
import IUnit from "../../unit/IUnit";
import IShoppingIngredient from "../IShoppingIngredient";
import BaseIngredientSchema from "./BaseIngredientSchema";

export default class ShoppingIngredientSchema extends BaseIngredientSchema implements IShoppingIngredient {
    itemID?: string;
    
    @ValidateNested()
    quantity: IUnit;

    recipeID?: number;

    constructor(
        id: number,
        name: string,
        category: string,
        quantityUnits: string[],
        quantity: IUnit,
        recipeID?: number
    ) {
        super(id, name, category, quantityUnits);
        
        this.quantity = quantity;
        this.recipeID = recipeID;
    }
}