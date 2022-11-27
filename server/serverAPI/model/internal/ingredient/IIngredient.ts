import INutrient from "../nutrients/INutrient";
import IBaseIngredient from "./IBaseIngredient";
import IIngredientCost from "./IIngredientCost";
import IIngredientQuantity from "./IIngredientQuantity";

/**
 * Food interface.
 */
export default interface IIngredient extends IBaseIngredient, IIngredientQuantity, IIngredientCost {   
    /**
     * Collection of nutrients that food contains.
     */
    nutrients?: INutrient[];
}
