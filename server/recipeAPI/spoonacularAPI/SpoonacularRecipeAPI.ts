import * as dotenv from 'dotenv';
dotenv.config();

import { URLSearchParams } from 'url';
import IncorrectIDFormat from '../../exceptions/IncorrectIDFormat';
import NoParameterFound from '../../exceptions/NoParameterFound';
import ParameterIsNotAllowed from '../../exceptions/ParameterIsNotAllowed';
import IFoodAPI from '../../foodAPI/IFoodAPI';
import IIngredient from '../../serverAPI/model/food/IIngredient';
import IInstruction from '../../serverAPI/model/instruction/IInstruction';
import INutrient from '../../serverAPI/model/nutrients/INutrient';
import IBaseRecipe from '../../serverAPI/model/recipe/IBaseRecipe';
import IRecipe from "../../serverAPI/model/recipe/IRecipe";
import SpoonacularAPI from '../../spoonacularUtils/SpoonacularAPI';
import IRecipeAPI from "../IRecipeAPI";

export default class SpoonacularRecipeAPI extends SpoonacularAPI implements IRecipeAPI {
    protected foodAPI: IFoodAPI;

    // https://spoonacular.com/food-api/docs#Search-Recipes-Complex
    protected recipeSearchParameters: Map<string, string>;

    // https://spoonacular.com/food-api/docs#Meal-Types
    protected mealTypes: Set<string>;

    constructor(apiKey: string, apiHost: string, foodAPI: IFoodAPI) {
        super(apiKey, apiHost);

        this.foodAPI = foodAPI;

        this.mealTypes = new Set([
            "main course",
            "side dish",
            "dessert",
            "appetizer",
            "salad",
            "bread",
            "breakfast",
            "soup",
            "beverage",
            "sauce",
            "drink"
        ]);

        this.recipeSearchParameters = new Map([
            ['query', 'query'],
            ['cuisines', 'cuisine'],
            ['diets', 'diet'],
            ['intolerances', 'intolerances'],
            ['mealTypes', 'type'],
            ['resultsPerPage', 'number'],
            ['page', 'offset']
        ]);
    }

    /**
     * Retrieves collection of partially filled Recipe items that satisfy searching parameters.
     * 
     * @param parameters parameters used for searching.
     * - query - required parameter that defines the name of the Recipe item (partial names are accepted).
     * - resultsPerPage - optional parameter that defines max number of the results to be returned.
     * - page - optional parameter that definds page number.     
     * - intolerances - optional parameter that defines the type of intolerances to be taken into consideration during searching.
     * - cuisines - optional parameter that limits search results to specific cuisines.
     * - mealTypes - optional parameter that limits search results to specific meal types.
     * 
     * @throws NoParameterFound exception when an invalid parameter is provided in the request.
     * @throws ParameterIsNotAllowed exception when encountering a non-existing parameter.
     * @returns Promise filled with a collection of Partial<IRecipe> objects.
     */
    async GetAll(parameters: Map<string, any>): Promise<IBaseRecipe[] | null> {
        let searchRecipeURL = process.env.SPOONACULAR_RECIPE_BASE_URL + '/complexSearch';

        let urlSearchParameters = this.convertSearchRecipeParameters(parameters);

        let response = await this.sendRequest(searchRecipeURL, urlSearchParameters);

        let jsonArray: any[] = response.results;

        let recipeArray: IBaseRecipe[] = [];

        for (let i = 0; i < jsonArray.length; i++) {
            recipeArray.push(
                await this.parseBaseRecipe(jsonArray[i])
            );
        }

        return recipeArray.length === 0 ? Promise.resolve(null) : Promise.resolve(recipeArray);
    }

    /**
     * Converts search recipe parameters to URLSearchParams.
     * 
     * @param parameters parameters used for searching.
     * - query - required parameter that defines the name of the Recipe item (partial names are accepted).
     * - resultsPerPage - optional parameter that defines max number of the results to be returned.
     * - page - optional parameter that definds page number.     
     * - intolerances - optional parameter that defines the type of intolerances to be taken into consideration during searching.
     * - cuisine - optional parameter that limits search results to specific cuisines.
     * - mealType - optional parameter that limits search results to specific meal types.
     * 
     * @throws NoParameterFound exception when an invalid parameter is provided in the request.
     * @throws ParameterIsNotAllowed exception when encountering a non-existing parameter.
     * @returns 
     */
    protected convertSearchRecipeParameters(parameters: Map<string, any>): URLSearchParams {
        let keys = Array.from(parameters.keys());

        let searchParameters = new URLSearchParams();

        if (!parameters.has("query")) {
            throw new NoParameterFound("Query parameter is missing.");
        }

        keys.forEach(key => {
            if (this.recipeSearchParameters.has(key)) {
                searchParameters.append(String(this.recipeSearchParameters.get(key)), parameters.get(key));
            } else {
                throw new ParameterIsNotAllowed(`Query parameter is not allowed ${key}`);
            }
        });

        searchParameters.append("instructionRequired", "true");
        searchParameters.append("addRecipeInformation", "true");

        return searchParameters;
    }

    protected async parseBaseRecipe(recipeObject: any): Promise<IBaseRecipe> {
        return Promise.resolve({
            id: recipeObject.id,
            name: recipeObject.title
        });
    }

    /**
     * Parses recipe object.
     * 
     * @param recipeObject json object that represents recipe in the API.
     * @returns Promise filled with IRecipe object.
     */
    protected async parseRecipe(recipeObject: any): Promise<IRecipe> {
        let instructionSteps: IInstruction[] = await this.parseInstructionSteps(recipeObject);
        let instruction: IInstruction = await this.combineInstructionSteps(instructionSteps);

        return Promise.resolve({
            id: recipeObject.id,
            name: recipeObject.title,
            cuisines: recipeObject.cuisines,
            diets: recipeObject.diets,
            mealType: recipeObject.dishTypes,
            instruction: instruction,
            instructionSteps: instructionSteps,
            servings: recipeObject.servings,
            preparationInMinutes: recipeObject.preparationMinutes,
            cookingTimeInMinutes: recipeObject.readyInMinutes,
            totalCost: recipeObject.pricePerServing * recipeObject.servings,
            costPerServing: recipeObject.pricePerServing
        });
    }

    private parseIngredients(ingredientObjects: any[]): IIngredient[] {
        let ingredients: IIngredient[] = [];

        for (let i = 0; i < ingredientObjects.length; i++) {
            ingredients.push(
                this.parseIngredient(ingredientObjects[i])
            );
        }

        return ingredients;
    }

    /**
     * Parses recipe object for instructions.
     * 
     * @param recipeObject json object that represents recipe in the API.
     * @returns Promise filled with collection of Instruction object.
     */
    protected async parseInstructionSteps(recipeObject: any): Promise<IInstruction[]> {
        let instructions: any[] = recipeObject.analyzedInstructions[0].steps;
        let ingredients: IIngredient[] = this.parseIngredients(recipeObject.nutrition.ingredients);

        let ingredientMap: Map<number, IIngredient> = new Map();
        
        ingredients.forEach(ingredient => {
            if (!ingredientMap.has(ingredient.id)) {
                ingredientMap.set(ingredient.id, ingredient);
            }
        });

        let instructionSteps: IInstruction[] = [];

        for (let i = 0; i < instructions.length; i++) {
            let stepIngredients: any[] = instructions[i].ingredients;
            let parsedIngredients: IIngredient[] = [];

            for (let j = 0; j < stepIngredients.length; j++) {
                let key = Number.parseInt(stepIngredients[j].id);

                if (ingredientMap.has(key)) {
                    parsedIngredients.push(ingredientMap.get(key)!);
                }
            }

            instructionSteps.push({
                instructions: instructions[i].step,
                ingredients: parsedIngredients
            });
        }

        return instructionSteps;
    }

    /**
     * Combines collection of instructions into one global Instruction object.
     * 
     * @param instructionSteps collection of Instruction objects.
     * @returns Promise filled with Instruction object.
     */
    protected async combineInstructionSteps(instructionSteps: IInstruction[]): Promise<IInstruction> {
        let ingredientsMap: Map<number, IIngredient> = new Map();
        let instructions: string = "";

        for (let i = 0; i < instructionSteps.length; i++) {
            let ingredients = instructionSteps[i].ingredients;
            instructions += instructionSteps[i].instructions + " ";

            for (let j = 0; j < ingredients.length; j++) {
                if (!ingredientsMap.has(ingredients[j].id)) {
                    ingredientsMap.set(ingredients[j].id, ingredients[j]);
                }
            }
        }

        instructions = instructions.slice(0, instructions.length - 1);

        return {
            instructions: instructions,
            ingredients: Array.from(ingredientsMap.values())
        };
    }

    /**
     * Looks for an ingredient through foodAPI.
     * 
     * @param ingredientObject json object that represents ingredient in the API.
     * @returns Promise filled with IFood object.
     */
    protected parseIngredient(ingredientObject: any): IIngredient {
        let id = ingredientObject.id;
        let name = ingredientObject.name;
        let category = "";

        let nutrients: INutrient[] = [];

        ingredientObject?.nutrients.forEach((nutrient: any) => {
            nutrients.push({
                name: nutrient.name,
                unit: {
                    unit: nutrient.unit,
                    value: Number.parseFloat(nutrient.amount)
                },
                percentOfDaily: Number.parseFloat(nutrient.percentOfDailyNeeds)
            });
        });

        return {
            id: id,
            name: name,
            category: category,
            nutrients: nutrients
        };
    }

    private isIngteger(number: string): boolean {
        return Number.isInteger(Number.parseInt(number));
    }

    /**
     * Retrieves specific Recipe item that is defined by unique identifier.
     * 
     * @param parameters parameters used for searching.
     * - id - required parameter that defines unique identifier of the Recipe item
     * 
     * @throws NoParameterFound exception when required parameters weren't found.
     * @throws IncorrectIDFormat exception when unique identifier has incorrect format.
     * 
     * @returns Promise filled with a IRecipe object or null when Recipe item wasn't found.
     */
    async Get(parameters: Map<string, any>): Promise<IRecipe | null> {
        if (!parameters.has("id")) {
            throw new NoParameterFound("Required parameter is missing.");
        }

        if (!this.isIngteger(String(parameters.get("id"))) ||
            Number.parseInt(String(parameters.get("id"))) <= 0) {
            throw new IncorrectIDFormat("ID has incorrect format.");
        }

        let recipeID = Number.parseInt(parameters.get("id"));

        let getRecipeURL = `${process.env.SPOONACULAR_RECIPE_BASE_URL}/${recipeID}/information`;

        let searchParameters = new URLSearchParams();
        searchParameters.set("includeNutrition", "true");

        let response = await this.sendRequest(getRecipeURL, searchParameters);

        let parsedRecipe = this.parseRecipe(response);

        return parsedRecipe;
    }
}
