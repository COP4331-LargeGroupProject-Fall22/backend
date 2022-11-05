import IUnit from "../unit/IUnit";
import IIngredient from "./IIngredient";

/**
 * IInventoryIngredient interface.
 */
export default interface IShoppingIngredient extends IIngredient {
    recipeID?: number;
    quantity: IUnit;
}
