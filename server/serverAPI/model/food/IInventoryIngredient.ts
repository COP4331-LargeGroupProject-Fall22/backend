import IIngredient from "./IIngredient";

/**
 * FoodItem interface.
 */
export default interface IInventoryIngredient extends IIngredient {
    readonly expirationDate: number;
}
