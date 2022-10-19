import IUnit from "../unit/IUnit";

/**
 * Nutrient interface.
 */
export default interface INutrient {
    readonly name: string;
    readonly unit: IUnit;
    readonly percentOfDaily: number;
}
