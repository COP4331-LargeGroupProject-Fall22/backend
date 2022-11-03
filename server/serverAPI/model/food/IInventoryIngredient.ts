import IIngredient from "./IIngredient";

/**
 * IInventoryIngredient interface.
 */
export default interface IInventoryIngredient extends IIngredient {
    readonly expirationDate: number;
}
