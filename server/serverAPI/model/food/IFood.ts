import INutrient from "../nutrients/INutrient";
import IWeight from "../weight/IWeight";

/**
 * Food interface.
 */
export default interface IFood {
    readonly name: string;
    readonly brandName: string;
    readonly category: string;
    readonly quantity: number;
    readonly packageWeight: IWeight[];
    readonly nutrients: Array<INutrient>;
    readonly expirationDate: number;
}
