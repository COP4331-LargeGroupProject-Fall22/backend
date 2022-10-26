import axios from 'axios';
import * as dotenv from 'dotenv';
import { URLSearchParams } from 'url';
import NoParameterFound from '../../exceptions/NoParameterFound';
import ParameterIsNotAllowed from '../../exceptions/ParameterIsNotAllowed';
import IFoodAPI from '../../foodAPI/IFoodAPI';
import IFood from '../../serverAPI/model/food/IFood';
import IInstruction from '../../serverAPI/model/instruction/IInstruction';
dotenv.config();

import IRecipe from "../../serverAPI/model/recipe/IRecipe";
import IRecipeAPI from "../IRecipeAPI";

export default class SpoonacularRecipeAPI implements IRecipeAPI {
    protected foodAPI: IFoodAPI;

    protected apiKey: string;
    protected host: string;

    protected recipeSearchParameters: Set<string>;
    protected recipeGetParameters: Set<string>;

    protected dishTypes: Set<string>;

    protected headers: any;

    constructor(foodAPI: IFoodAPI) {
        this.foodAPI = foodAPI;

        this.apiKey = process.env.SPOONACULAR_API_KEY;
        this.host = process.env.SPOONACULAR_HOST;

        this.dishTypes = new Set([
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

        this.recipeSearchParameters = new Set([
            'query',
            'cuisine',
            'diet',
            'intolerences',
            'includeIngredients',
            'type'
        ]);

        this.recipeGetParameters = new Set([

        ]);
    }

    /**
     * Retrieves collection of partially filled Recipe items that satisfy searching parameters.
     * 
     * @param parameters parameters used for searching.
     * - query - required parameter that defines the name of the Recipe item (partial names are accepted).
     * - number - optional parameter that defines max number of the results to be returned.
     * - page - optional parameter that defines page number for pagination.
     * - intolerence - optional parameter that defines the type of intolerences to be taken in consideration during searching.
     * - cuisine - optional parameter that limits search results to specific cuisines.
     * - type - optional parameter that limits search results to specific dish types.
     * 
     * @throws NoParameterFound exception when required parameters weren't found.
     * @throws ParameterIsNotAllowed exception when encountering a non-existing parameter.
     * 
     * @returns Promise filled with a collection of Partial<IRecipe> objects.
     */
    async SearchRecipe(parameters: Map<string, any>): Promise<Partial<IRecipe>[]> {
        let searchRecipeURL = process.env.SPOONACULAR_RECIPE_BASE_URL + '/complexSearch';

        let urlSearchParameters = this.convertSearchRecipeParameters(parameters);

        let response = await axios(
            searchRecipeURL,
            {
                headers: this.headers,
                params: urlSearchParameters
            }
        );

        let jsonArray: any[] = response.data.results;
        let recipeArray: IRecipe[] = [];
        
        for (let i = 0; i < jsonArray.length; i++) {
            recipeArray.push(
                await this.parseRecipe(jsonArray[i])
            );
        }

        return recipeArray;
    }

    /**
     * Converts search recipe parameters to URLSearchParams.
     * 
     * @param parameters parameters used for searching.
     * - query - required parameter that defines the name of the Recipe item (partial names are accepted).
     * - number - optional parameter that defines max number of the results to be returned.
     * - page - optional parameter that defines page number for pagination.
     * - intolerence - optional parameter that defines the type of intolerences to be taken in consideration during searching.
     * - cuisine - optional parameter that limits search results to specific cuisines.
     * - type - optional parameter that limits search results to specific dish types.
     * 
     * @throws NoParameterFound exception when required parameters weren't found.
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
            if (this.recipeSearchParameters.has(String(key))) {
                if (key === "page") {
                    searchParameters.append("offset", String(parameters.get(key)));
                } else {
                    searchParameters.append(key, String(parameters.get(key)));
                }
            }
            else {
                throw new ParameterIsNotAllowed(`Query parameter is not allowed ${key}`);
            }
        });

        searchParameters.append("instructionRequired", "true");

        return searchParameters;
    }

    protected async parseRecipe(recipeObject: any): Promise<IRecipe> {
        return {
            id: recipeObject.id,
            name: recipeObject.title,
            cuisines: recipeObject.cuisines,
            diets: recipeObject.diets,
            type: this.parseDishTypes(recipeObject.dishTypes),
            instruction: await this.parseInstructions(recipeObject),
            instructionSteps: await this.parseInstructionSteps(recipeObject),
            servings: recipeObject.servings,
            preparationInMinutes: recipeObject.preparationMinutes,
            cookingTimeInMinutes: recipeObject.readyInMinutes,
            totalCost: recipeObject.pricePerServing * recipeObject.servings
        }
    }

    protected async parseInstructionSteps(recipeObject: any) : Promise<IInstruction[]> {
        let instructons: any[] = recipeObject.analyzedInstructions[0].steps;

        let instructionSteps: IInstruction[] = [];

        for (let i = 0; i < instructons.length; i++) {
            let ingredients: any[] = instructons[i];
            let parsedIngredients: IFood[] = [];

            for (let j = 0; j < ingredients.length; j++) {
                let parsedIngredient = await this.parseIngredient(ingredients[j]);
                parsedIngredients.push(parsedIngredient);
            }

            instructionSteps.push({
                instructions: instructons[i].step,
                ingredients: parsedIngredients
            });
        }

        return instructionSteps;
    }

    protected async parseInstructions(recipeObject: any): Promise<IInstruction> {
        let instructons: any[] = recipeObject.analyzedInstructions[0].steps;
        let ingredients: any[] = recipeObject.extendedIngredients;

        let parsedIngredients: IFood[] = [];

        for (let i = 0; i < ingredients.length; i++) {
            let parsedIngredient = await this.parseIngredient(ingredients[i]);
            parsedIngredients.push(parsedIngredient);
        }

        let parsedInstructions: string = "";

        for (let i = 0; i < instructons.length; i++) {
            let parsedInstruction = instructons[i].step;
            parsedInstructions += parsedInstruction + " ";
        }

        parsedInstructions = parsedInstructions.slice(0, parsedInstructions.length - 1);

        return {
            instructions: parsedInstructions,
            ingredients: parsedIngredients
        }
    }

    protected async parseIngredient(ingredientObject: any): Promise<IFood> {
        let food = await this.foodAPI.GetFood(new Map([
            ["id", ingredientObject.id]
        ]));

        if (food !== null && food.name === ingredientObject.nameClear) {
            return food;
        }

        let foods = await this.foodAPI.GetFoods(new Map([
            ["query", ingredientObject.nameClean]
        ]));

        if (foods.length !== 0) {
            // Need better logic here...
            return (await this.foodAPI.GetFood(new Map([
                ["id", foods[0].id]
            ])))!;
        }    

        return {
            id: ingredientObject.id,
            name: ingredientObject.nameClean,
            category: ingredientObject.aisle,
            nutrients: []
        }
    }

    protected parseDishTypes(recipeDishTypes: string[]): string {
        let type = "";

        recipeDishTypes.forEach((type: string) => {
            if (this.dishTypes.has(type)) {
                type += type + ", ";
            }
        });

        type = type.slice(0, type.length - 1);

        return type;
    }


    /**
     * Retrieves specific Recipe item that is defined by unique identifier.
     * 
     * @param parameters parameters used for searching.
     * - id - required parameter that defines unique identifier of the Recipe item
     * 
     * @throws NoParameterFound exception when required parameters weren't found.
     *
     * @returns Promise filled with a IRecipe object or null when Recipe item wasn't found.
     */
    GetRecipe(parameters: Map<string, any>): Promise<IRecipe | null> {
        throw new Error("Method not implemented.");
    }

}