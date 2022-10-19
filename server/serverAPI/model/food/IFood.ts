import INutrient from "../nutrients/INutrient";
import IUnit from "../unit/IUnit";

/**
 * Food interface.
 */
export default interface IFood {
    readonly name: string;
    readonly category: string;
    readonly quantity: number;
    readonly packageWeight: IUnit[];
    readonly nutrients: INutrient[];
    readonly expirationDate: number;
}
