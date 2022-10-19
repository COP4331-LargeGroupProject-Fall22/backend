import axios from "axios";
import { exit } from "process";
import ISpoonacularFoodScheme from "../../serverAPI/model/food/ISpoonacularFood";
import INutrient from "../../serverAPI/model/nutrients/INutrient";
import IUnit from "../../serverAPI/model/unit/IUnit";
import IFoodAPI from "../IFoodAPI";

/**
 * This class implements IFoodAPI interface using Spoonacular API.
 */
export default class SpoonacularAPI implements IFoodAPI {
    private apiKey: string;

    private foodSearchParameters: Set<string>;
    private foodInfoParameters: Set<string>;

    constructor(apiKey: string) {
        this.apiKey = apiKey;
        this.foodSearchParameters = new Set([
            'query',
            'minCalories',
            'maxCalories',
            'minCarbs',
            'maxCarbs',
            'minProtein',
            'maxProtein',
            'minFat',
            'maxFat',
            'offset',
            'number'
        ]);
        this.foodInfoParameters = new Set([
            'id'
        ]);
    }

    private parseFoodSummary = (data: any): Partial<ISpoonacularFoodScheme>[] => {
        let parsedData = JSON.parse(data);

        let foods: Partial<ISpoonacularFoodScheme>[] = [];

        parsedData.products.forEach((product: any) => {
            foods.push({
                id: product.id,
                name: product.title
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

    GetFoods(parameters: Map<string, any>): Promise<Partial<ISpoonacularFoodScheme>[]> {
        let foodSearchBaseURL: string = process.env.SPOONACULAR_GROCERY_PRODUCT_SEARCH_URL;

        let searchParams = this.convertFoodSummaryParameters(parameters);

        if (searchParams.toString().length === 0) {
            return new Promise((resolve) => resolve([]));
        }

        searchParams.append("apiKey", this.apiKey);


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

    private parseFoodComplete = (data: any): ISpoonacularFoodScheme => {
        let parsedData = JSON.parse(data);

        let name = parsedData.title;
        let id = parsedData.id;
        let category = parsedData.aisle;

        let nutrients: INutrient[] = [];

        parsedData.nutrition.nutrients.forEach((nutrient: any) => {
            nutrients.push({
                name: nutrient.name,
                unit: {
                    unit: nutrient.unit,
                    value: Number.parseFloat(nutrient.amount)
                },
                percentOfDaily: Number.parseFloat(nutrient.percentOfDailyNeeds)
            });
        });

        // Placeholder
        let packageWeight: IUnit[] = [];
        packageWeight.push({
            unit: "",
            value: -1
        });

        return {
            id: id,
            name: name,
            category: category,
            nutrients: nutrients,
            quantity: 1,
            expirationDate: 1,
            packageWeight: packageWeight
        };
    }

    GetFood(parameters: Map<string, any>): Promise<ISpoonacularFoodScheme | null> {
        if (!parameters.has("id")) {
            return new Promise((resolve) => resolve(null));
        }

        let foodGetInfoBaseURL: string = process.env.SPOONACULAR_GROCERY_PRODUCT_GET_INFO_URL + parameters.get("id");

        let searchParams = new URLSearchParams();

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
}
