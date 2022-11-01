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
    readonly nutrients: INutrient[];

    readonly quantity?: IUnit;
}
