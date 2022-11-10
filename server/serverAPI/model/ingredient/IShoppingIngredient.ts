import IUnit from "../unit/IUnit";
import IBaseIngredient from "./IBaseIngredient";

/**
 * IShoppingIngredient interface.
 */
export default interface IShoppingIngredient extends IBaseIngredient {
    // Unique item identifier.
    itemID?: string;

    // Unique recipe identifier.
    recipeID?: number;
    
    // Quantity of shopping ingredient.
    quantity: IUnit;
}
