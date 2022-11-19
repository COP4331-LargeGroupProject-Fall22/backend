import IImage from "../image/IImage";
import IInstruction from "../instruction/IInstruction";
import INutrient from "../nutrients/INutrient";
import IRecipe from "./IRecipe";

export default class IUserRecipe implements IRecipe {
    cuisines: string[];
    diets: string[];
    mealTypes: string[];
    instruction: IInstruction;
    nutritionFacts: INutrient[];
    instructionSteps: IInstruction[];
    servings: number;
    cookingTimeInMinutes: number;
    preparationTimeInMinutes: number;
    totalCost: number;
    costPerServing: number;
    id: number;
    name: string;
    image: IImage;
    favorite: boolean;

    constructor(recipe: IRecipe, favorite: boolean) {
        this.cuisines = recipe.cuisines;
        this.diets = recipe.diets;
        this.mealTypes = recipe.mealTypes;
        this.instruction = recipe.instruction;
        this.nutritionFacts = recipe.nutritionFacts;
        this.instructionSteps = recipe.instructionSteps;
        this.servings = recipe.servings;
        this.cookingTimeInMinutes = recipe.cookingTimeInMinutes;
        this.preparationTimeInMinutes = recipe.preparationTimeInMinutes;
        this.totalCost = recipe.totalCost;
        this.costPerServing = recipe.costPerServing;
        this.id = recipe.id;
        this.name = recipe.name;
        this.image = recipe.image;
        this.favorite = favorite;
    }
}
