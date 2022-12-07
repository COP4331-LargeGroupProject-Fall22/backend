import IncorrectIDFormat from "../../exceptions/IncorrectIDFormat";
import NoParameterFound from "../../exceptions/NoParameterFound";
import ParameterIsNotAllowed from "../../exceptions/ParameterIsNotAllowed";

import IBaseIngredient from "../../serverAPI/model/internal/ingredient/IBaseIngredient";
import IIngredient from "../../serverAPI/model/internal/ingredient/IIngredient";
import INutrient from "../../serverAPI/model/internal/nutrients/INutrient";
import IUnit from "../../serverAPI/model/internal/unit/IUnit";
import IIngredientAPI from "../IIngredientAPI";

import SpoonacularAPI from "../../spoonacularUtils/SpoonacularAPI";
import IImage from "../../serverAPI/model/internal/image/IImage";
import IPrice from "../../serverAPI/model/internal/money/IPrice";
import PaginatedResponse from "../../serverAPI/model/internal/paginatedResponse/PaginatedResponse";

/**
 * This class implements IIngredientAPI interface using Spoonacular API.
 */
export default class SpoonacularIngredientAPI extends SpoonacularAPI implements IIngredientAPI {
    // https://spoonacular.com/food-api/docs#Ingredient-Search
    private foodSearchParameters: Map<string, string>;

    // https://spoonacular.com/food-api/docs#Get-Ingredient-Information
    private foodInfoParameters: Map<string, string>;

    // Allowed food units for conversion operations
    private foodUnits: Set<string>;

    protected MAX_RESULTS_PER_PAGE = 100;
    protected DEFAULT_RESULTS_PER_PAGE = 10;

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
    private convertGetAllParameters = (parameters: Map<string, any>): URLSearchParams => {
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

        searchParams.set("number", this.MAX_RESULTS_PER_PAGE.toString());

        return searchParams;
    }

    private isInteger(number: string): boolean {
        return Number.isInteger(Number(number));
    }

    private async searchPagination(jsonArray: any[], resultsPerPage?: string, page?: string): Promise<PaginatedResponse<IBaseIngredient>> {
        let partialFoods: IBaseIngredient[] = [];

        let offset: number = 0;

        let totalResults = jsonArray.length;

        let resultsPerPageNumber = resultsPerPage === undefined ? this.DEFAULT_RESULTS_PER_PAGE : Number(resultsPerPage);

        let pageNumber = page === undefined ? 0 : Number(page);;

        offset = resultsPerPageNumber * pageNumber;
        totalResults = Math.min(resultsPerPageNumber + offset, jsonArray.length);

        for (let i = offset; i < totalResults; i++) {
            let object = jsonArray[i];

            let parsedFood = await this.parseIngredient(object);

            partialFoods.push({
                id: parsedFood.id,
                name: parsedFood.name,
                category: parsedFood.category,
                image: parsedFood.image
            });
        }

        let numOfPages = Math.ceil(jsonArray.length / resultsPerPageNumber);

        return new PaginatedResponse(numOfPages, jsonArray.length, pageNumber, partialFoods);
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

        let response: any;

        try {
            response = await this.getRequest(converterBaseURL, searchParams);
        } catch (error) {
            return Promise.reject("Call was made to convertUnits. " + error);
        }

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
     * @returns Promise filled with an array of IIngredient objects.
     */
    async GetAll(parameters: Map<string, any>): Promise<PaginatedResponse<IBaseIngredient> | null> {
        let searchIngredientsBaseURL: string = process.env.SPOONACULAR_INGREDIENTS_BASE_URL + "/autocomplete";

        let searchParameters = this.convertGetAllParameters(parameters);

        searchParameters.append("metaInformation", "true");

        let response: any;

        try {
            response = await this.getRequest(searchIngredientsBaseURL, searchParameters);
        } catch (error) {
            return Promise.reject("Call was made to the getAllIngredients. " + error);
        }

        if (response === null) {
            return null;
        }

        return this.searchPagination(response, parameters.get("resultsPerPage"), parameters.get("page"));
    }

    private parseNutrients = async (data: any): Promise<INutrient[]> => {
        let nutrients: INutrient[] = [];

        data?.nutrition?.nutrients.forEach((nutrient: any) => {
            nutrients.push({
                name: nutrient.name,
                unit: {
                    unit: nutrient.unit,
                    value: Number(nutrient.amount).toString()
                },
                percentOfDaily: Number(nutrient.percentOfDailyNeeds)
            });
        });

        return nutrients;
    }

    private parseQuantity = async (data: any): Promise<IUnit> => {
        let quantity: IUnit = { unit: "", value: "some" };

        if (data.amount !== undefined && data.unit !== undefined) {
            quantity = {
                unit: data.unit,
                value: Number.isNaN(Number(data.amount)) ?
                    "some" : this.roundToTwoDecimalPlaces(Number(data.amount)).toString()
            };
        }

        return quantity;
    }

    private roundToTwoDecimalPlaces(num: number): number {
        return Math.round((num + Number.EPSILON) * 100) / 100
    }

    private parseImage = async (data: any): Promise<IImage> => {
        let image = (data.image as string);

        let srcUrl = `${process.env.SPOONACULAR_CDN_BASE_URL}/${image.substring(image.lastIndexOf('/') + 1)}`;

        return {
            srcUrl: srcUrl
        };
    }

    private parsePrice = async (data: any): Promise<IPrice> => {
        let price: IPrice = { price: 0, currency: "" };

        if (data.estimatedCost !== undefined) {
            price = {
                price: data.estimatedCost.value,
                currency: data.estimatedCost.unit
            };
        }

        return price;
    }

    /**
     * Parses plain javascript object as IIngredient object.
     * 
     * @param data representing food as plain javascript object.
     * @returns Promise filled with IIngredient object.
     */
    private parseIngredient = async (data: any): Promise<IIngredient> => {
        let id = data.id;
        let name = data.name;
        let category = String(data.aisle).replaceAll(";", ", ");
        let quantityUnits = data.possibleUnits;

        return {
            id: id,
            name: name,
            category: category,
            nutrients: await this.parseNutrients(data),
            quantityUnits: quantityUnits,
            quantity: await this.parseQuantity(data),
            image: await this.parseImage(data),
            price: await this.parsePrice(data)
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
    private convertGetParameters = (parameters: Map<string, any>): URLSearchParams => {
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

        // false && false, false && true, true && false
        if (hasAmount !== hasUnit || !hasAmount && !hasUnit) {
            searchParams.delete("amount");
            searchParams.delete("unit");

            searchParams.set("amount", "200");
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
     * @returns Promise filled with IIngredient object on successful search or null.
     */
    async Get(parameters: Map<string, any>): Promise<IIngredient | null> {
        if (!parameters.has("id")) {
            throw new NoParameterFound("id parameter is missing");
        }

        if (!this.isInteger(String(parameters.get("id"))) ||
            Number(String(parameters.get("id"))) <= 0) {
            throw new IncorrectIDFormat("IngredientID has incorrect format.");
        }

        let ingredientID = Number(parameters.get("id"));
        // id is not part of the query, therefore it should not be part of the parameters in URLSearch.
        parameters.delete("id");

        let getIngredientBaseURL: string = process.env.SPOONACULAR_INGREDIENTS_BASE_URL + `/${ingredientID}/information`;

        let searchParameters = this.convertGetParameters(parameters);

        let response: any;

        try {
            response = await this.getRequest(getIngredientBaseURL, searchParameters);
        } catch (error) {
            return Promise.reject("Call was made to the getIngredient. " + error);
        }

        if (response == null) {
            return Promise.resolve(null);
        }

        let parsedIngredient = await this.parseIngredient(response);

        return parsedIngredient;
    }

    // TODO(#57): Add support for finding food items by UPC
    GetByUPC(parameters: Map<string, any>): Promise<IIngredient | null> {
        throw new Error('not implemented yet');
    }
}
