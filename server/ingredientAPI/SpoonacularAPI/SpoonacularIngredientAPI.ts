import IncorrectIDFormat from "../../exceptions/IncorrectIDFormat";
import NoParameterFound from "../../exceptions/NoParameterFound";
import ParameterIsNotAllowed from "../../exceptions/ParameterIsNotAllowed";
import IBaseIngredient from "../../serverAPI/model/ingredient/IBaseIngredient";
import IIngredient from "../../serverAPI/model/ingredient/IIngredient";
import INutrient from "../../serverAPI/model/nutrients/INutrient";
import IUnit from "../../serverAPI/model/unit/IUnit";
import SpoonacularAPI from "../../spoonacularUtils/SpoonacularAPI";
import IIngredientAPI from "../IIngredientAPI";

/**
 * This class implements IFoodAPI interface using Spoonacular API.
 */
export default class SpoonacularIngredientAPI extends SpoonacularAPI implements IIngredientAPI {
    // https://spoonacular.com/food-api/docs#Ingredient-Search
    private foodSearchParameters: Map<string, string>;

    // https://spoonacular.com/food-api/docs#Get-Ingredient-Information
    private foodInfoParameters: Map<string, string>;

    // Allowed food units for conversion operations
    private foodUnits: Set<string>;

    constructor(apiKey: string, apiHost: string) {
        super(apiKey, apiHost);

        this.foodSearchParameters = new Map([
            ['ingredientName', 'query'],
            ['resultsPerPage', 'resultsPerPage'],
            ['page', 'page'],
            ['language', 'language'],
            ['intolerance', 'intolerance']
        ]);

        this.foodInfoParameters = new Map([
            ['quantity', 'amount'],
            ['unit', 'unit']
        ]);

        this.foodUnits = new Set(
            ["kg", "g", "oz", "piece", "serving", "slice", "cup", "fruit", "container", "teaspoon", "tablespoon", "ounces", "cloves"]
        );
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

        if (!parameters.has("ingredientName")) {
            throw new NoParameterFound("ingredientName parameter is missing.");
        }

        keys.forEach(key => {
            if (this.foodSearchParameters.has(key)) {
                searchParams.append(String(this.foodSearchParameters.get(key)), parameters.get(key));
            } else {
                throw new ParameterIsNotAllowed(`Query parameter is not allowed ${key}`);
            }
        });

        searchParams.set("amount", "100");

        return searchParams;
    }

    private isInteger(number: string): boolean {
        return Number.isInteger(Number.parseInt(number));
    }

    private async searchPagination(jsonArray: any[], resultsPerPage?: string, page?: string): Promise<IBaseIngredient[]> {
        let partialFoods: IBaseIngredient[] = [];

        let start: number = 0;
        
        let length = jsonArray.length;

        if (resultsPerPage !== undefined && page !== undefined &&
            this.isInteger(resultsPerPage) && this.isInteger(page)) {
            start = Number.parseInt(resultsPerPage) * (Number.parseInt(page) - 1);
            length = Math.min(Number.parseInt(resultsPerPage) + start, jsonArray.length);
        }

        for (let i = start; i < length; i++) {
            let object = jsonArray[i];

            let parsedFood = await this.parseFood(object);

            partialFoods.push({
                id: parsedFood.id,
                name: parsedFood.name,
                category: parsedFood.category,
                quantityUnits: parsedFood.quantityUnits
            });
        }

        return partialFoods;
    }

    private async parseUnit(jsonObject: any): Promise<IUnit> {
        return {
            unit: jsonObject.targetUnit,
            value: jsonObject.targetAmount
        };
    }

    async ConvertUnits(oldAmount: IUnit, targetUnit: string, ingredientName: string): Promise<IUnit | null> {
        let converterBaseURL: string = process.env.SPOONACULAR_CONVERTER_BASE_URL;

        if (!this.foodUnits.has(targetUnit) || !this.foodUnits.has(oldAmount.unit)) {
            return Promise.resolve(null);
        }

        let searchParams = new URLSearchParams();
        searchParams.set("targetUnit", targetUnit);
        searchParams.set("sourceAmount", oldAmount.value.toString());
        searchParams.set("sourceUnit", oldAmount.unit);
        searchParams.set("ingredientName", ingredientName);

        let response = await this.sendRequest(converterBaseURL, searchParams);

        if (response === null) {
            return null;
        }

        let parsedUnit = await this.parseUnit(response);

        return parsedUnit;
    }

    /**
     * Retrieves array of food items that satisfy searching parameters.
     * 
     * @param parameters query parameters used for searching.
     * - query - required parameter that defines the name of the Food Item (partial names are accepted).
     * - resultsPerPage - optional parameter that defines max number of the results to be returned.
     * - page - optional parameter that defines page number.
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
        let quantityUnits = data.possibleUnits;
        let quantity: IUnit | undefined = undefined

        if (data.amount !== undefined && data.unit !== undefined) {
            quantity = {
                unit: data.unit,
                value: data.amount
            };
        }

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
            nutrients: nutrients,
            quantityUnits: quantityUnits,
            quantity: quantity
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

        // Checks that if one of these is set, both are set
        let hasAmount = searchParams.has("amount");
        let hasUnit = searchParams.has("unit");

        if (hasAmount !== hasUnit) {
            searchParams.delete("amount");
            searchParams.delete("unit");

            searchParams.set("amount", "1");
            searchParams.set("unit", "serving");
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

        if (!this.isInteger(String(parameters.get("id"))) || 
            Number.parseInt(String(parameters.get("id"))) <= 0) {
            throw new IncorrectIDFormat("IngredientID has incorrect format.");
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
