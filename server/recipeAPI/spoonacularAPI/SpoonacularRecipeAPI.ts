import { isURL } from 'class-validator';
import * as dotenv from 'dotenv';
dotenv.config();

import { URLSearchParams } from 'url';

import IncorrectIDFormat from '../../exceptions/IncorrectIDFormat';
import NoParameterFound from '../../exceptions/NoParameterFound';
import ParameterIsNotAllowed from '../../exceptions/ParameterIsNotAllowed';

import IIngredientAPI from '../../ingredientAPI/IIngredientAPI';
import IImage from '../../serverAPI/model/internal/image/IImage';
import IIngredient from '../../serverAPI/model/internal/ingredient/IIngredient';
import IInstruction from '../../serverAPI/model/internal/instruction/IInstruction';
import INutrient from '../../serverAPI/model/internal/nutrients/INutrient';
import IBaseRecipe from '../../serverAPI/model/internal/recipe/IBaseRecipe';
import IRecipe from "../../serverAPI/model/internal/recipe/IRecipe";
import IUnit from '../../serverAPI/model/internal/unit/IUnit';
import IRecipeAPI from "../IRecipeAPI";

import SpoonacularAPI from '../../spoonacularUtils/SpoonacularAPI';
import PriceSchema from '../../serverAPI/model/internal/money/PriceSchema';
import PaginatedResponse from '../../serverAPI/model/internal/paginatedResponse/PaginatedResponse';

export default class SpoonacularRecipeAPI extends SpoonacularAPI implements IRecipeAPI {
    protected ingredientAPI: IIngredientAPI;

    protected PRICE_WIDGET = process.env.SPOONACULAR_RECIPE_PRICE_BREAKDOWN_WIDGET;
    protected API_INGREDIENTS_BASE_URL = process.env.SPOONACULAR_RECIPE_PRICE_BREAKDOWN_BASE_URL;

    // https://spoonacular.com/food-api/docs#Search-Recipes-Complex
    protected recipeSearchParameters: Map<string, string>;

    // https://spoonacular.com/food-api/docs#Meal-Types
    protected mealTypes: Set<string>;

    protected MAX_OFFSET = 900;
    protected MAX_RESULTS_PER_PAGE = 100;
    protected DEFAULT_RESULTS_PER_PAGE = 10;

    constructor(apiKey: string, apiHost: string, ingredientAPI: IIngredientAPI) {
        super(apiKey, apiHost);

        this.ingredientAPI = ingredientAPI;

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

        // Map ServerAPI parameters to spoonacularAPI parameters 
        this.recipeSearchParameters = new Map([
            ['recipeName', 'query'],
            ['cuisines', 'cuisine'],
            ['diets', 'diet'],
            ['intolerances', 'intolerances'],
            ['mealTypes', 'type'],
            ['resultsPerPage', 'number'],
            ['page', 'page'],
            ["hasIngredients", "includeIngredients"]
        ]);
    }

    /**
     * Retrieves collection of partially filled Recipe items that satisfy searching parameters.
     * 
     * @param parameters parameters used for searching.
     * - recipeName - required parameter that defines the name of the Recipe item (partial names are accepted).
     * - resultsPerPage - optional parameter that defines max number of the results to be returned.
     * - page - optional parameter that defines page number.
     * - intolerances - optional parameter that defines the type of intolerances to be taken into consideration during searching.
     * - cuisines - optional parameter that limits search results to specific cuisines.
     * - mealTypes - optional parameter that limits search results to specific meal types.
     * @throws NoParameterFound exception when an invalid parameter is provided in the request.
     * @throws ParameterIsNotAllowed exception when encountering a non-existing parameter.
     * @returns Promise filled with a collection of Partial<IBaseRecipe> objects or null when BaseRecipe items weren't found.
     */
    async GetAll(parameters: Map<string, any>): Promise<PaginatedResponse<IBaseRecipe> | null> {
        let searchRecipeURL = process.env.SPOONACULAR_RECIPE_BASE_URL + '/complexSearch';

        let searchParameters: URLSearchParams;

        try {
            searchParameters = await this.convertSearchRecipeParameters(parameters);
        } catch (error) {
            return Promise.reject(error);
        }

        let response: any;

        try {
            response = await this.getRequest(searchRecipeURL, searchParameters);
        } catch(error) {
            return Promise.reject("Call was made to the GetAllRecipes." + error);
        }

        let jsonArray: any[] = response.results;

        let recipeArray: IBaseRecipe[] = [];

        for (let i = 0; i < jsonArray.length; i++) {
            recipeArray.push(await this.parseBaseRecipe(jsonArray[i]));
        }

        let resultsPerPage = Number.parseInt(searchParameters.get("number")!);

        let totalResults = Math.min(response.totalResults, this.MAX_OFFSET);

        let numOfPages = Math.ceil(totalResults / resultsPerPage);

        let currentPage = parameters.get("page") === undefined ? 0 : parameters.get("page");

        let result = currentPage >= numOfPages ? [] : recipeArray;

        return recipeArray.length === 0 ? null : new PaginatedResponse(numOfPages, totalResults, currentPage, result);
    }

    /**
     * Converts search recipe parameters to URLSearchParams.
     * 
     * @param parameters parameters used for searching.
     * - recipeName - required parameter that defines the name of the Recipe item (partial names are accepted).
     * - resultsPerPage - optional parameter that defines max number of the results to be returned.
     * - page - optional parameter that definds page number.     
     * - intolerances - optional parameter that defines the type of intolerances to be taken into consideration during searching.
     * - cuisine - optional parameter that limits search results to specific cuisines.
     * - mealType - optional parameter that limits search results to specific meal types.
     * - hasIngredients - optional parameter that constrains search result to recipes that contains specified ingredients.
     * (ingredient list should be represented as comma separated ingredient names)
     * @throws NoParameterFound exception when an invalid parameter is provided in the request.
     * @throws ParameterIsNotAllowed exception when encountering a non-existing parameter.
     * @returns 
     */
    protected convertSearchRecipeParameters(parameters: Map<string, any>): Promise<URLSearchParams> {
        let keys = Array.from(parameters.keys());

        let searchParameters = new URLSearchParams();

        if (!parameters.has("recipeName")) {
            throw new NoParameterFound("recipeName parameter is missing.");
        }

        searchParameters.set("number", this.DEFAULT_RESULTS_PER_PAGE.toString());

        keys.forEach(key => {
            if (this.recipeSearchParameters.has(key)) {
                if (key === 'page') {
                    let page = parameters.get("page") !== undefined ? Number.parseInt(parameters.get("page")!) : 0;

                    let resultsPerPage = parameters.get("resultsPerPage") !== undefined ?
                        Number.parseInt(parameters.get("resultsPerPage")!) : this.DEFAULT_RESULTS_PER_PAGE;

                    let offset = page * resultsPerPage;

                    searchParameters.append("offset", offset.toString());
                }

                searchParameters.set(String(this.recipeSearchParameters.get(key)), parameters.get(key));
            } else {
                throw new ParameterIsNotAllowed(`${key} parameter is not allowed.`);
            }
        });

        searchParameters.append("instructionsRequired", "true");
        searchParameters.append("fillIngredients", "true");

        return Promise.resolve(searchParameters);
    }

    protected async parseRecipeImage(recipeObject: any): Promise<IImage> {
        return {
            srcUrl: recipeObject.image
        };
    }

    protected async parseBaseRecipe(recipeObject: any): Promise<IBaseRecipe> {
        let ingredients: IIngredient[] = this.parseIngredientsForBaseRecipe(recipeObject);

        return {
            id: recipeObject.id,
            name: recipeObject.title,
            image: await this.parseRecipeImage(recipeObject),
            ingredients: ingredients
        };
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
            image: await this.parseRecipeImage(recipeObject),
            cuisines: recipeObject.cuisines,
            diets: recipeObject.diets,
            mealTypes: recipeObject.dishTypes,
            nutritionFacts: this.parseNutrients(recipeObject.nutrition.nutrients),
            ingredients: instruction.ingredients,
            instruction: instruction,
            instructionSteps: instructionSteps,
            servings: recipeObject.servings,
            preparationTimeInMinutes: recipeObject.preparationMinutes,
            cookingTimeInMinutes: recipeObject.readyInMinutes,
            totalCost: recipeObject.pricePerServing * recipeObject.servings,
            costPerServing: recipeObject.pricePerServing
        };
    }

    private async addPriceToIngredients(recipeID: number, ingredients: IIngredient[]): Promise<IIngredient[]> {
        let priceWidgetURL = `${this.API_INGREDIENTS_BASE_URL}/${recipeID}/${this.PRICE_WIDGET}`;

        let response: any;

        try {
            response = await this.getRequest(priceWidgetURL);
        } catch (error) {
            return Promise.reject("Call was made to the PriceBreakdownWidget. " + error);
        }

        let ingredientPrices: [string, number][] = [];

        response.ingredients.forEach((ingredient: any) => ingredientPrices.push([ingredient.name, ingredient.price]));

        for (let i = 0; i < ingredients.length; i++) {
            for (let j = 0; j < ingredientPrices.length; j++) {
                if (ingredientPrices[j][0].includes(ingredients[i].name)) {
                    ingredients[i].price = new PriceSchema(ingredientPrices[j][1], "US Cents");
                    break;
                }
            }
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
        let ingredients: IIngredient[] = await this.parseIngredientsForRecipe(recipeObject);

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

        // Removes last whitespace.
        instructions = instructions.slice(0, instructions.length - 1);

        return {
            instructions: instructions,
            ingredients: Array.from(ingredientsMap.values())
        };
    }

    protected parseNutrients(nutrientsArray?: any[]): INutrient[] {
        let nutrients: INutrient[] = [];

        nutrientsArray?.forEach((nutrient: any) => {
            nutrients.push({
                name: nutrient.name,
                unit: {
                    unit: nutrient.unit,
                    value: Number.parseFloat(nutrient.amount)
                },
                percentOfDaily: Number.parseFloat(nutrient.percentOfDailyNeeds)
            });
        });

        return nutrients;
    }

    private parseImage(imageName: string): IImage {
        let srcUrl = `${process.env.SPOONACULAR_CDN_BASE_URL}/${imageName.substring(imageName.lastIndexOf('/') + 1)}`;

        return {
            srcUrl: srcUrl
        };
    }

    /**
     * Looks for an ingredient through ingredientAPI.
     * 
     * @param ingredientObject json object that represents ingredient in the API.
     * @returns Promise filled with Iingredient object.
     */
    protected parseIngredientsForBaseRecipe(recipeObject: any): IIngredient[] {
        let ingredients: IIngredient[] = [];

        recipeObject.missedIngredients.forEach((ingredientObject: any) => {
            let id = ingredientObject.id;
            let name = ingredientObject.name;
            let category = ingredientObject.aisle;
            let quantity: IUnit = {
                unit: ingredientObject.unit,
                value: Number.parseFloat(ingredientObject.amount)
            };

            ingredients.push({
                id: id,
                name: name,
                category: category,
                quantityUnits: [quantity.unit],
                quantity: quantity,
                image: this.parseImage(ingredientObject.image)
            });
        })

        return ingredients;
    }

    protected async parseIngredientsForRecipe(recipeObject: any): Promise<IIngredient[]> {
        let ingredients: IIngredient[] = [];

        recipeObject.nutrition.ingredients.forEach((ingredientObject: any) => {
            let id = ingredientObject.id;
            let name = ingredientObject.name;
            let quantity: IUnit = {
                unit: ingredientObject.unit,
                value: Number.parseFloat(ingredientObject.amount)
            };

            ingredients.push({
                id: id,
                name: name,
                category: "",
                nutrients: this.parseNutrients(ingredientObject?.nutrients),
                quantityUnits: [quantity.unit],
                quantity: quantity,
                image: { srcUrl: "" }
            });
        });

        let ingredientMap: Map<number, any> = new Map();

        recipeObject.extendedIngredients.forEach((ingredientObject: any) => {
            ingredientMap.set(
                ingredientObject.id,
                {
                    category: ingredientObject.aisle,
                    image: this.parseImage(ingredientObject.image)
                }
            );
        });

        for (let i = 0; i < ingredients.length; i++) {
            let object = ingredientMap.get(ingredients[i].id);

            if (object !== null && object !== undefined) {
                ingredients[i].category = object.category;
                ingredients[i].image = object.image;
            }
        }

        return await this.addPriceToIngredients(recipeObject.id, ingredients);
    }

    private isIngteger(number: string): boolean {
        return Number.isInteger(Number.parseInt(number));
    }

    /**
     * Retrieves specific Recipe item that is defined by unique identifier.
     * 
     * @param parameters parameters used for searching.
     * - id - required parameter that defines unique identifier of the Recipe item
     * @throws NoParameterFound exception when required parameters weren't found.
     * @throws IncorrectIDFormat exception when unique identifier has incorrect format.
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

        let response: any;
        
        try {
            response = await this.getRequest(getRecipeURL, searchParameters);
        } catch(error) {
            return Promise.reject("Call was made to the getRecipe. " + error);
        }

        let parsedRecipe = this.parseRecipe(response);

        return parsedRecipe;
    }
}
