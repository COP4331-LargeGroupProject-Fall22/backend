import axios from "axios";
import { resolve } from "path";
import { exit } from "process";
import IFood from "../serverAPI/model/food/IFood";
import INutrient from "../serverAPI/model/nutrients/INutrient";
import IWeight from "../serverAPI/model/weight/IWeight";
import IFoodAPI from "./IFoodAPI";

/**
 * This class implements IFoodAPI interface using U.S. Deparptment of Agriculture's FoodData Central API.
 */
export default class FoodAPI implements IFoodAPI {
    private apiKey: string;

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    /**
     * This method parses json string containing information about food.
     * 
     * @param json string representing food object in FoodData Central API.
     * @returns IFood[] containing all parsed foods as IFood objects.
     */
    private parseFood = (json: string): IFood[] => {
        let jsonObject = JSON.parse(json);
        let foods: IFood[] = [];

        let parseWeight = this.parseWeight;
        let parseNutrient = this.parseNutrient;

        jsonObject.foods.forEach(function(foodObject: any) {
            let name = foodObject.description;
            let brandName = foodObject.brandName !== undefined ? foodObject.brandName : "";
            let category = foodObject.foodCategory;
            let packageWeight = foodObject.packageWeight !== undefined ? parseWeight(foodObject.packageWeight) : [];
            let nutrients = foodObject.foodNutrients !== undefined ? parseNutrient(foodObject.foodNutrients) : [];

            foods.push({
                name: name,
                brandName: brandName,
                category: category,
                quantity: 1,
                packageWeight: packageWeight,
                nutrients: nutrients,
                expirationDate: 0
            });
        });

        return foods;
    }

    /**
     * This method parses jsonArray containing information about nutrients.
     * 
     * @param jsonArray array representing an array of nutrient objects in FoodData Central API.
     * @returns INutrient[] containing all parsed nutrients as INutrient objects.
     */
    private parseNutrient = (jsonArray: []): INutrient[] => {
        let nutrients: INutrient[] = [];

        jsonArray.forEach((nutrientObject: any) => {
            let name = nutrientObject.nutrientName;
            let value = nutrientObject.value;

            nutrients.push({
                name: name,
                value: Number.parseFloat(value)
            });
        });

        return nutrients;
    }

    /**
     * This method parses json string containing information about food object's weight.
     * 
     * @param json string representing weight information about food object in FoodData Central API.
     * @returns IWeight[] containing all parsed weights as INutrient objects.
     */
    private parseWeight = (json: string): IWeight[] => {
        let weights: IWeight[] = [];

        let jsonArr = json.split("/");

        jsonArr.forEach(weight => {
            let parameters = weight.split(' ');

            let weightValue = Number.parseFloat(parameters[0]);
            let weightUnit = parameters[1];

            weights.push({
                unit: weightUnit,
                value: weightValue
            });
        });

        return weights;
    }

    /**
     * This method is used for searching for food in API based on provided parameters.
     * 
     * @param parameters query parameters used for searching.
     * - query - a parameter which defines the query string (food name).
     * - pageSize - an optional parameter which defines max pageSize (default = 10, min = 1, max = 200).
     * - pageNumber - an optional parameter which defines pageNumber (default = 1).    
     * @returns Promised filled with IFood[] or null if food wasn't found.
     */
    async GetFood(parameters?: Map<String, any> | undefined): Promise<IFood[]> {
        let baseURL: string = process.env.FOOD_DATA_CENTRAL_SEARCH_URL;

        let searchParams = new URLSearchParams();

        let pageSize = 10;
        if (parameters?.get("pageSize") !== undefined) {
            pageSize = parameters.get("pageSize");
        }

        let pageNumber = 1;
        if (parameters?.get("pageNumber") !== undefined) {
            pageNumber = parameters.get("pageNumber");
        }

        searchParams.append("api_key", this.apiKey);
        searchParams.append("query", parameters?.get("query"));
        searchParams.append("pageSize", pageSize.toString());
        searchParams.append("pageNumber", pageNumber.toString());

        let parseFood = this.parseFood;

        let response = axios.get(
            baseURL,
            {
                transformResponse: [function (data) {
                    return parseFood(data);
                }],
                params: searchParams
            }
        );

        return new Promise(async (resolve) => {
            resolve((await response).data);
        });
    }
}
