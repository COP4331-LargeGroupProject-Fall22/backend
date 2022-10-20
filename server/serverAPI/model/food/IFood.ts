import INutrient from "../nutrients/INutrient";

/**
 * Food interface.
 */
export default interface IFood {
    readonly id: number;
    readonly name: string;
    readonly category: string;
    readonly nutrients: INutrient[];
}
