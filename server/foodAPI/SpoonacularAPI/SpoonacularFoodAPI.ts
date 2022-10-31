import IncorrectIDFormat from "../../exceptions/IncorrectIDFormat";
import NoParameterFound from "../../exceptions/NoParameterFound";
import ParameterIsNotAllowed from "../../exceptions/ParameterIsNotAllowed";
import IBaseIngredient from "../../serverAPI/model/food/IBaseIngredient";
import IIngredient from "../../serverAPI/model/food/IIngredient";
import INutrient from "../../serverAPI/model/nutrients/INutrient";
import SpoonacularAPI from "../../spoonacularUtils/SpoonacularAPI";
import IFoodAPI from "../IFoodAPI";

/**
 * This class implements IFoodAPI interface using Spoonacular API.
 */
export default class SpoonacularFoodAPI extends SpoonacularAPI implements IFoodAPI {
    // https://spoonacular.com/food-api/docs#Ingredient-Search
    private foodSearchParameters: Map<string, string>;

    // https://spoonacular.com/food-api/docs#Get-Ingredient-Information
    private foodInfoParameters: Map<string, string>;

    constructor(apiKey: string, apiHost: string) {
        super(apiKey, apiHost);

        this.foodSearchParameters = new Map([
            ['query', 'query'],
            ['resultsPerPage', 'number'],
            ['language', 'language'],
            ['intolerance', 'intolerance']
        ]);

        this.foodInfoParameters = new Map([
            ['quantity', 'amount'],
            ['unit', 'unit']
        ]);
    }

    /**
     * Converts parameters of getFoods method to URLSearchParams object.
     * 
     * @param parameters defined for the summary search.
     * 
     * @throws NoParameterFound exception when required parameters weren't found.
     * @throws ParameterIsNotAllowed exception when encountering a non-existing parameter.
     * @returns URLSearchParams filled with parameters.
     */
    private convertFoodsParameters = (parameters: Map<string, any>): URLSearchParams => {
        let keys = Array.from(parameters.keys());

        let searchParams = new URLSearchParams();

        if (!parameters.has("query")) {
            throw new NoParameterFound("Query parameter is missing.");
        }

        keys.forEach(key => {
            if (this.foodSearchParameters.has(key)) {
                searchParams.append(String(this.foodSearchParameters.get(key)), parameters.get(key));
            } else {
                throw new ParameterIsNotAllowed(`Query parameter is not allowed ${key}`);
            }
        });

        return searchParams;
    }

    private isIngteger(number: string): boolean {
        return Number.isInteger(Number.parseInt(number));
    }

    private async searchPagination(jsonArray: any[], resultsPerPage?: string, page?: string): Promise<IBaseIngredient[]> {
        let partialFoods: IBaseIngredient[] = [];

        let offset: number = Number.MAX_SAFE_INTEGER;
        
        if (resultsPerPage !== undefined && page !== undefined &&
            this.isIngteger(resultsPerPage) && this.isIngteger(page)) {
            offset = Number.parseInt(resultsPerPage) * Number.parseInt(page);
        }

        let length = Math.min(offset, jsonArray.length);

        for (let i = 0; i < length; i++) {
            let object = jsonArray[i];

            let parsedFood = await this.parseFood(object);

            partialFoods.push({
                id: parsedFood.id,
                name: parsedFood.name,
                category: parsedFood.category
            });
        }

        return partialFoods;
    }

    /**
     * Retrieves array of food items that satisfy searching parameters.
     * 
     * @param parameters query parameters used for searching.
     * - query - required parameter that defines the name of the Food Item (partial names are accepted).
     * - resultsPerPage - optional parameter that defines max number of the results to be returned.
     * - page - optional parameter that definds page number.
     * - intolerance - optional parameter that defines the type of intolerances to be taken in consideration during searching.
     * Complete list of intolerences is available at https://spoonacular.com/food-api/docs#Intolerances 
     * 
     * @throws NoParameterFound exception when required parameters weren't found.
     * @throws RequestLimitReached excpetion when request limit has been reached.
     * @returns Promise filled with an array of IFood objects.
     */
    async GetAll(parameters: Map<string, any>): Promise<IBaseIngredient[] | null> {
        let foodSearchBaseURL: string = process.env.SPOONACULAR_INGREDIENTS_BASE_URL + "/autocomplete";

        let searchParams = this.convertFoodsParameters(parameters);

        searchParams.append("metaInformation", "true");

        let response = await this.sendRequest(foodSearchBaseURL, searchParams);

        if (response === null) {
            return null;
        }

        return this.searchPagination(response, parameters.get("resultsPerPage"), parameters.get("page"));
    }

    /**
     * Parses plain javascript object as IFood object.
     * 
     * @param data representing food as plain javascript object.
     * @returns Promise filled with IFood object.
     */
    private parseFood = async (data: any): Promise<IIngredient> => {
        let id = data.id;
        let name = data.name;
        let category = data.aisle;

        let nutrients: INutrient[] = [];

        data?.nutrition?.nutrients.forEach((nutrient: any) => {
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

    /**
     * Converts parameters of getFood method to URLSearchParams object.
     * 
     * @param parameters defined for the summary search.
     * @throws ParameterIsNotAllowed exception when encountering a non-existing parameter.
     * 
     * @returns URLSearchParams filled with parameters.
    */
    private convertFoodParameters = (parameters: Map<string, any>): URLSearchParams => {
        let keys = Array.from(parameters.keys());

        let searchParams = new URLSearchParams();

        keys.forEach(key => {
            if (this.foodInfoParameters.has(key)) {
                searchParams.append(String(this.foodInfoParameters.get(key)), parameters.get(key));
            } else {
                throw new ParameterIsNotAllowed(`Query parameter is not allowed ${key}`);
            }
        });

        // (A && !B) || (!A && B)
        let isAmount = searchParams.has("amount");
        let isUnit = searchParams.has("unit");

        if ((isAmount && !isUnit) || (!isAmount && isUnit)) {
            searchParams.delete("amount");
            searchParams.delete("unit");
        }
        else {
            searchParams.set("amount", "100");
            searchParams.set("unit", "g");
        }

        return searchParams;
    }

    /**
     * Retrieves food item that is specified by searching parameters.
     * 
     * @param parameters query parameters used for searching.
     * - id - required parameter that defines unique identifier of the Food Item.
     * - quantity - optional parameter that defines the amount of that food items.
     * - unit - optional parameter that defines the unit for given amount.
     * 
     * @throws IncorrectIDFormat exception when id has incorrect format.
     * @throws NoParameterFound exception when required parameters weren't found. 
     * @returns Promise filled with IFood object on successful search or null.
     */
    async Get(parameters: Map<string, any>): Promise<IIngredient | null> {
        if (!parameters.has("id")) {
            throw new NoParameterFound("id parameter is missing");
        }

        if (!this.isIngteger(String(parameters.get("id"))) || 
            Number.parseInt(String(parameters.get("id"))) <= 0) {
            throw new IncorrectIDFormat("FoodID has incorrect format.");
        }

        let foodID = Number.parseInt(parameters.get("id"));
        // id is not part of the query, therefore it should not be part of the parameters in URLSearch.
        parameters.delete("id");

        let foodGetInfoBaseURL: string = process.env.SPOONACULAR_INGREDIENTS_BASE_URL + `/${foodID}/information`;

        let searchParams = this.convertFoodParameters(parameters);

        let response = await this.sendRequest(foodGetInfoBaseURL, searchParams);

        if (response == null) {
            return Promise.resolve(null);
        }

        let jsonObject = response;
        let parsedFood = await this.parseFood(jsonObject);

        return parsedFood;
    }

    // TODO(#57): Add support for finding food items by UPC
    GetByUPC(parameters: Map<string, any>): Promise<IIngredient | null> {
        throw new Error('not implemented yet');
    }
}
