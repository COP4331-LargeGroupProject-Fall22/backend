import IFood from "./IFood";

/**
 * FoodItem interface.
 */
export default interface IFoodItem extends IFood {
    readonly expirationDate: number;
}
