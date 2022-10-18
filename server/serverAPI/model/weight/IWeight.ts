import { WeightUnits } from "./WeightUnits";

/**
 * Weight interface.
 */
export default interface IWeight {
    readonly unit: WeightUnits;
    readonly value: number;
}
