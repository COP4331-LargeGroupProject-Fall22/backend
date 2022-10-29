import * as dotenv from 'dotenv';
dotenv.config();

import { URLSearchParams } from 'url';
import IncorrectIDFormat from '../../exceptions/IncorrectIDFormat';
import NoParameterFound from '../../exceptions/NoParameterFound';
import ParameterIsNotAllowed from '../../exceptions/ParameterIsNotAllowed';
import IFoodAPI from '../../foodAPI/IFoodAPI';
import IIngredient from '../../serverAPI/model/food/IIngredient';
import IInstruction from '../../serverAPI/model/instruction/IInstruction';
import IBaseRecipe from '../../serverAPI/model/recipe/IBaseRecipe';
import IRecipe from "../../serverAPI/model/recipe/IRecipe";
import SpoonacularAPI from '../../spoonacularUtils/SpoonacularAPI';
import IRecipeAPI from "../IRecipeAPI";

export default class SpoonacularRecipeAPI extends SpoonacularAPI implements IRecipeAPI {
    protected foodAPI: IFoodAPI;

    protected recipeSearchParameters: Map<string, string>;

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
    async GetAll(parameters: Map<string, any>): Promise<IBaseRecipe[]> {
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

        return recipeArray;
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

        return {
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
        }
    }

    /**
     * Parses recipe object for instructions.
     * 
     * @param recipeObject json object that represents recipe in the API.
     * @returns Promise filled with collection of Instruction object.
     */
    protected async parseInstructionSteps(recipeObject: any): Promise<IInstruction[]> {
        let instructions: any[] = recipeObject.analyzedInstructions[0].steps;

        let instructionSteps: IInstruction[] = [];

        let ingredientMap: Map<string, IIngredient> = new Map();

        for (let i = 0; i < instructions.length; i++) {
            let ingredients: any[] = instructions[i].ingredients;
            let parsedIngredients: IIngredient[] = [];

            for (let j = 0; j < ingredients.length; j++) {
                let hashIngredient = JSON.stringify(ingredients[j]);
                let parsedIngredient: IIngredient;

                if (!ingredientMap.has(hashIngredient)) {
                    parsedIngredient = await this.parseIngredient(ingredients[j]);
                    ingredientMap.set(hashIngredient, parsedIngredient);
                }

                parsedIngredients.push(ingredientMap.get(hashIngredient)!);
            }

            instructionSteps.push({
                instructions: instructions[i].step,
                ingredients: parsedIngredients
            });
        }

        return instructionSteps;
    }

    /**
     * Hashing an object.
     * 
     * @param food Ifood object.
     * @returns pseudo hash of he food object.
     */
    private calculateFoodHash(food: IIngredient): string {
        return "#" + String(food.id) + "#" + food.name + "#" + food.category + "#" + String(food.nutrients);
    }

    /**
     * Combines collection of instructions into one global Instruction object.
     * 
     * @param instructionSteps collection of Instruction objects.
     * @returns Promise filled with Instruction object.
     */
    protected async combineInstructionSteps(instructionSteps: IInstruction[]): Promise<IInstruction> {
        let ingredientsMap: Map<string, IIngredient> = new Map();
        let instrucions: string = "";

        for (let i = 0; i < instructionSteps.length; i++) {
            let ingredients = instructionSteps[i].ingredients;
            instrucions += instructionSteps[i].instructions + " ";

            for (let j = 0; j < ingredients.length; j++) {
                let foodHash = this.calculateFoodHash(ingredients[j]);

                if (!ingredientsMap.has(foodHash)) {
                    ingredientsMap.set(foodHash, ingredients[j]);
                }
            }
        }

        instrucions = instrucions.slice(0, instrucions.length - 1);

        return {
            instructions: instrucions,
            ingredients: Array.from(ingredientsMap.values())
        };
    }

    /**
     * Looks for an ingredient through foodAPI.
     * 
     * @param ingredientObject json object that represents ingredient in the API.
     * @returns Promise filled with IFood object.
     */
    protected async parseIngredient(ingredientObject: any): Promise<IIngredient> {
        let parsedName = ingredientObject.name !== undefined ? ingredientObject.name : "undefined";
        let parsedID = ingredientObject.id !== undefined ? ingredientObject.id : -1;
        let parsedCategory = ingredientObject.aisle !== undefined ? ingredientObject.aisle : "";

        // Is there any other way to avoid "exception eating"
        // 1 request call to API
        let food: IIngredient | null;
        try {
            food = await this.foodAPI.Get(new Map([["id", parsedID]]));

            if (food !== null) {
                return food;
            }
        } catch (error) { }

        return {
            id: parsedID,
            name: parsedName,
            category: parsedCategory,
            nutrients: []
        }
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

        let response = await this.sendRequest(getRecipeURL);

        let jsonObject: any = response;
        let parsedRecipe = this.parseRecipe(jsonObject);

        return parsedRecipe;
    }
}
