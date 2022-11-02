import IInstruction from "../instruction/IInstruction";
import IBaseRecipe from "./IBaseRecipe";

/**
 * Recipe interface.
 */
export default interface IRecipe extends IBaseRecipe {
    // TODO(#56): add support for allergens
    
    /**
     * Collection of cuisines to which recipe belongs.
     */ 
    readonly cuisines: string[];

    /**
     * Collection of diets to which recipe belongs.
     */
    readonly diets: string[];

    /**
     * Type of the dish that is going to be cooked. e.g. main dish, dessert etc.
     */
    readonly mealTypes: string[];
    
    /**
     * Complete instructions including all needed ingredients and cooking instructions.
     */
    readonly instruction: IInstruction;
    
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
    readonly preparationInMinutes: number;

    /**
     * Approximate total cost of the meal in USD.
     */
    readonly totalCost: number;

    /**
     * Approximate cost of the meal per serving in USD.
     */
    readonly costPerServing: number;
}
