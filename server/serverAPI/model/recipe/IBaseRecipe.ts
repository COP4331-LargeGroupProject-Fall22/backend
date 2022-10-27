import IInstruction from "../instruction/IInstruction";

export default interface IBaseRecipe {
    /**
     * Unique recipe identifier.
     */
    readonly id: number;

    /**
     * Recipe name.
     */
    readonly name: string;
}
