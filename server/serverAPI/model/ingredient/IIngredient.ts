import INutrient from "../nutrients/INutrient";
import IBaseIngredient from "./IBaseIngredient";
import IIngredientQuantity from "./IIngredientQuantity";

/**
 * Food interface.
 */
export default interface IIngredient extends IBaseIngredient, IIngredientQuantity {   
    /**
     * Food quantity units.
     */
     quantityUnits: string[];

    /**
     * Collection of nutrients that food contains.
     */
    nutrients?: INutrient[];
}
