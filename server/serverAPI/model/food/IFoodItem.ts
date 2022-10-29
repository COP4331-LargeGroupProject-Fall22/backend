import IFood from "./IFood";

/**
 * FoodItem interface.
 */
export default interface IFoodItem extends IFood {
    //TODO(#48): Expiration Date on duplicate items
    readonly expirationDate: number;
}
