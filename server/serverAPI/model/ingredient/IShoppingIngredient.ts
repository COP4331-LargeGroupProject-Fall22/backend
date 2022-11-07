import IUnit from "../unit/IUnit";
import IBaseIngredient from "./IBaseIngredient";

/**
 * IShoppingIngredient interface.
 */
export default interface IShoppingIngredient extends IBaseIngredient {
    itemID?: string;

    recipeID?: number;
    
    quantity: IUnit;
}
