import IIngredient from "../ingredient/IIngredient";
import IInstruction from "../instruction/IInstruction";
import INutrient from "../nutrients/INutrient";
import IBaseRecipe from "./IBaseRecipe";

/**
 * Recipe interface.
 */
export default interface IRecipe extends IBaseRecipe<IIngredient> {   
    /**
     * Complete instructions including all needed ingredients and cooking instructions.
     */
    readonly instruction: IInstruction;

    /**
     * Complete information about nutrients in the recipe.
     */
    readonly nutritionFacts: INutrient[];
    
    /**
     * Step by step instructions. Each step includes all needed ingredients for current step and instructions.
     */
    readonly instructionSteps: IInstruction[];

    /**
     * Number of servings per recipe.
     */
    readonly servings: number;

    /**
     * Cooking time in minutes.
     */
    readonly cookingTimeInMinutes: number;

    /**
     * Preparation time in minutes.
     */
    readonly preparationTimeInMinutes: number;

    /**
     * Approximate total cost of the meal in USD.
     */
    readonly totalCost: number;

    /**
     * Approximate cost of the meal per serving in USD.
     */
    readonly costPerServing: number;
}
