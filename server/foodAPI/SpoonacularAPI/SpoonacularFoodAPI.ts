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
            'number',
            'language',
            'intolerence'
        ]);

        this.foodInfoParameters = new Set([
            'amount',
            'unit'
        ])
    }

    private parseFoodSummary = (data: any): Partial<IFood>[] => {
        let foods: Partial<IFood>[] = [];

        let parseFood = this.parseFood;

        data.forEach((ingredient: any) => {
            let food = parseFood(ingredient);

            foods.push({
                id: food.id,
                name: food.name,
                category: food.category
            });
        });

        return foods;
    }

    private convertFoodSummaryParameters = (parameters: Map<String, any>): URLSearchParams => {
        let keys = Array.from(parameters.keys());

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
                    let parsedData = JSON.parse(data);
                    return parseFoodSummary(parsedData);
                }],
                params: searchParams
            }
        );

        return new Promise(async (resolve) => resolve((await response).data));
    }

    private parseFood = (data: any): IFood => {
        let name = data.name;
        let id = data.id;
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

    private convertFoodInfoParameters = (parameters: Map<String, any>): URLSearchParams => {
        let keys = Array.from(parameters.keys());

        let searchParams = new URLSearchParams();

        keys.forEach(key => {
            if (this.foodInfoParameters.has(String(key))) {
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

        let parseFoodComplete = this.parseFood;

        let response = axios.get(
            foodGetInfoBaseURL,
            {
                transformResponse: [function (data) {
                    let parsedData = JSON.parse(data);
                    return parseFoodComplete(parsedData);
                }],
                params: searchParams
            }
        );

        return new Promise(async (resolve) => resolve((await response).data));
    }

    GetFoodByUPC(parameters: Map<string, any>): Promise<IFood | null> {
        throw new Error('not implemented yet');
    }
}
