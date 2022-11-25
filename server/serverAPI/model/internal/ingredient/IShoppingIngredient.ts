import IBaseIngredient from "./IBaseIngredient";
import IIngredientQuantity from "./IIngredientQuantity";

/**
 * IShoppingIngredient interface.
 */
export default interface IShoppingIngredient extends IBaseIngredient, IIngredientQuantity {
    // Unique item identifier.
    itemID?: string;

    // Unique recipe identifier.
    recipeID?: number;
}
