import IBaseIngredient from "./IBaseIngredient";

/**
 * IInventoryIngredient interface.
 */
export default interface IInventoryIngredient extends IBaseIngredient {
    expirationDate: number | null;
}
