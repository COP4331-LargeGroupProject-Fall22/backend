import IBaseIngredient from "./IBaseIngredient";
import IIngredientCost from "./IIngredientCost";
import IIngredientQuantity from "./IIngredientQuantity";

/**
 * IShoppingIngredient interface.
 */
export default interface IShoppingIngredient extends IBaseIngredient, IIngredientQuantity, IIngredientCost {
    // Unique item identifier.
    itemID?: string;

    // Unique recipe identifier.
    recipeID: number | null;
    recipeName: string | null;

    dateAdded: number;
}
