import INutrient from "../nutrients/INutrient";
import IUnit from "../unit/IUnit";
import IBaseIngredient from "./IBaseIngredient";

/**
 * Food interface.
 */
export default interface IIngredient extends IBaseIngredient {
    /**
     * Collection of nutrients that food contains.
     */
    nutrients: INutrient[];

    quantity?: IUnit;
}
