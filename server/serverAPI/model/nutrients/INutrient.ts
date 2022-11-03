import IUnit from "../unit/IUnit";

/**
 * Nutrient interface.
 */
export default interface INutrient {
    name: string;
    unit: IUnit;
    percentOfDaily: number;
}
