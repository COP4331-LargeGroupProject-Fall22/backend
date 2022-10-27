import IBaseFood from "../food/IBaseFood";

/**
 * Instruction interface.
 */
 export default interface IBaseInstruction {
    /**
     * Instructions explain everything that needs to be done to cook the meal.
     */
    readonly instructions: string;

    /**
     * Ingredients store all required food items that are needed for instruction.
     */
    readonly ingredients: IBaseFood[];
}
