import IFood from "../food/IFood";

/**
 * Instruction interface.
 */
export default interface IInstruction {
    /**
     * Instructions explain everything that needs to be done to cook the meal.
     */
    readonly instructions: string;

    /**
     * Ingredients store all required food items that are needed for instruction.
     */
    readonly ingredients: IFood[];
}