import axios from "axios";
import { exit } from "process";
import IFood from "../../serverAPI/model/food/IFood";
import INutrient from "../../serverAPI/model/nutrients/INutrient";
import IFoodAPI from "../IFoodAPI";

/**
 * This class implements IFoodAPI interface using Spoonacular API.
 */
export default class SpoonacularFoodAPI implements IFoodAPI {
    private apiKey: string;

    private foodSearchParameters: Set<string>;
    private foodInfoParameters: Set<string>;

    constructor(apiKey: string) {
        this.apiKey = apiKey;
        this.foodSearchParameters = new Set([
            'query',
            'number',
            'language',
            'metaInformation'
        ]);

        this.foodInfoParameters = new Set([
            'id',
            'amount',
            'unit'
        ])
    }

    private parseFoodSummary = (data: any): Partial<IFood>[] => {
        let parsedData = JSON.parse(data);

        let foods: Partial<IFood>[] = [];

        parsedData.forEach((ingredient: any) => {
            foods.push({
                id: ingredient.id,
                name: ingredient.name,
                category: ingredient.aisle
            });
        });

        return foods;
    }

    private convertFoodSummaryParameters = (parameters: Map<String, any>): URLSearchParams => {
        let keys =  Array.from(parameters.keys());

        let searchParams = new URLSearchParams();

        if (!parameters.has("query"))
            return searchParams;

        keys.forEach(key => {
            if (this.foodSearchParameters.has(String(key))) {
                searchParams.append(String(key), String(parameters.get(key)));    
            }
        });

        return searchParams;
    }

    async GetFoods(parameters: Map<string, any>): Promise<Partial<IFood>[]> {
        let foodSearchBaseURL: string = process.env.SPOONACULAR_INGREDIENTS_BASE_URL + "/autocomplete";
        
        let searchParams = this.convertFoodSummaryParameters(parameters);

        if (searchParams.toString().length === 0) {
            return new Promise((resolve) => resolve([]));
        }

        searchParams.append("apiKey", this.apiKey);
        searchParams.append("metaInformation", "true");

        let parseFoodSummary = this.parseFoodSummary;

        let response = axios.get(
            foodSearchBaseURL,
            {
                transformResponse: [function (data) {
                    return parseFoodSummary(data);
                }],
                params: searchParams
            }
        );

        return new Promise(async (resolve) => {
            resolve((await response).data);
        });
    }

    private parseFoodComplete = (data: any): IFood => {
        let parsedData = JSON.parse(data);

        let name = parsedData.name;
        let id = parsedData.id;
        let category = parsedData.aisle;

        let nutrients: INutrient[] = [];

        parsedData?.nutrition?.nutrients.forEach((nutrient: any) => {
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

    private convertFoodInfoParameters = (parameters: Map<String, any>): URLSearchParams => {
        let keys =  Array.from(parameters.keys());

        let searchParams = new URLSearchParams();

        keys.forEach(key => {
            if (this.foodSearchParameters.has(String(key))) {
                searchParams.append(String(key), String(parameters.get(key)));    
            }
        });

        return searchParams;
    }

    GetFood(parameters: Map<string, any>): Promise<IFood | null> {
        if (!parameters.has("id"))
            return new Promise((resolve) => resolve(null));

        let foodGetInfoBaseURL: string = process.env.SPOONACULAR_INGREDIENTS_BASE_URL + `/${parameters.get("id")}/information`;

        let searchParams = this.convertFoodInfoParameters(parameters);

        if (!searchParams.has("amount"))
            searchParams.set("amount", "1");

        searchParams.append("apiKey", this.apiKey);

        let parseFoodComplete = this.parseFoodComplete;

        let response = axios.get(
            foodGetInfoBaseURL,
            {
                transformResponse: [function (data) {
                    return parseFoodComplete(data);
                }],
                params: searchParams
            }
        );

        return new Promise(async (resolve) => {
            resolve((await response).data);
        });
    }

    GetFoodByUPC(parameters: Map<string, any>): Promise<IFood | null> {
        throw new Error('not implemented yet');
        
        // if (!parameters.has("upc")) {
        //     return new Promise((resolve) => resolve(null));
        // }

        // let foodGetInfoBaseURL: string = process.env.SPOONACULAR_GROCERY_PRODUCT_GET_INFO_BY_UPC_URL + parameters.get("upc");

        // let searchParams = new URLSearchParams();

        // searchParams.append("apiKey", this.apiKey);

        // let parseFoodComplete = this.parseFoodComplete;

        // let response = axios.get(
        //     foodGetInfoBaseURL,
        //     {
        //         transformResponse: [function (data) {
        //             return parseFoodComplete(data);
        //         }],
        //         params: searchParams
        //     }
        // );

        // return new Promise(async (resolve) => {
        //     resolve((await response).data);
        // });
    }
}
