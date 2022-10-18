import { IsArray, IsInt, IsNotEmpty, IsObject, IsPositive, IsString } from "class-validator";

/**
 * Nutrient interface.
 */
export default interface INutrient {
    readonly name: string;
    readonly value: number;
}
