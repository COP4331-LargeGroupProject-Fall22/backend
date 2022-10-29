import INutrient from "../nutrients/INutrient";
import IBaseFood from "./IBaseFood";

/**
 * Food interface.
 */
export default interface IFood extends IBaseFood {
    /**
     * Collection of nutrients that food contains.
     */
    readonly nutrients: INutrient[];
}
