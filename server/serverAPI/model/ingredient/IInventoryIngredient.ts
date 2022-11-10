import IBaseIngredient from "./IBaseIngredient";
import IIngredient from "./IIngredient";

/**
 * IInventoryIngredient interface.
 */
export default interface IInventoryIngredient extends IBaseIngredient {
    expirationDate: number;
}
