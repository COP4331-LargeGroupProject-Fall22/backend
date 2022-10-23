"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
/**
 * This class implements IFoodAPI interface using Spoonacular API.
 */
class SpoonacularFoodAPI {
    constructor(apiKey) {
        this.parseFoodSummary = (data) => {
            let foods = [];
            let parseFood = this.parseFood;
            data.forEach((ingredient) => {
                let food = parseFood(ingredient);
                foods.push({
                    id: food.id,
                    name: food.name,
                    category: food.category
                });
            });
            return foods;
        };
        this.convertFoodSummaryParameters = (parameters) => {
            let keys = Array.from(parameters.keys());
            let searchParams = new URLSearchParams();
            if (!parameters.has("query")) {
                return searchParams;
            }
            keys.forEach(key => {
                if (this.foodSearchParameters.has(String(key))) {
                    searchParams.append(String(key), String(parameters.get(key)));
                }
            });
            return searchParams;
        };
        this.parseFood = (data) => {
            let name = data.name;
            let id = data.id;
            let category = data.aisle;
            let nutrients = [];
            data?.nutrition?.nutrients.forEach((nutrient) => {
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
        };
        this.convertFoodInfoParameters = (parameters) => {
            let keys = Array.from(parameters.keys());
            let searchParams = new URLSearchParams();
            keys.forEach(key => {
                if (this.foodInfoParameters.has(String(key))) {
                    searchParams.append(String(key), String(parameters.get(key)));
                }
            });
            return searchParams;
        };
        this.apiKey = apiKey;
        this.foodSearchParameters = new Set([
            'query',
            'number',
            'language',
            'intolerence'
        ]);
        this.foodInfoParameters = new Set([
            'amount',
            'unit'
        ]);
    }
    async GetFoods(parameters) {
        let foodSearchBaseURL = process.env.SPOONACULAR_INGREDIENTS_BASE_URL + "/autocomplete";
        let searchParams = this.convertFoodSummaryParameters(parameters);
        if (searchParams.toString().length === 0) {
            return new Promise((resolve) => resolve([]));
        }
        searchParams.append("apiKey", this.apiKey);
        searchParams.append("metaInformation", "true");
        let parseFoodSummary = this.parseFoodSummary;
        let response = axios_1.default.get(foodSearchBaseURL, {
            transformResponse: [function (data) {
                    let parsedData = JSON.parse(data);
                    console.log(parsedData);
                    return parseFoodSummary(parsedData);
                }],
            params: searchParams
        });
        return new Promise(async (resolve) => resolve((await response).data));
    }
    GetFood(parameters) {
        if (!parameters.has("id"))
            return new Promise((resolve) => resolve(null));
        let foodGetInfoBaseURL = process.env.SPOONACULAR_INGREDIENTS_BASE_URL + `/${parameters.get("id")}/information`;
        let searchParams = this.convertFoodInfoParameters(parameters);
        if (!searchParams.has("amount")) {
            searchParams.set("amount", "1");
        }
        searchParams.append("apiKey", this.apiKey);
        let parseFoodComplete = this.parseFood;
        let response = axios_1.default.get(foodGetInfoBaseURL, {
            transformResponse: [function (data) {
                    let parsedData = JSON.parse(data);
                    return parseFoodComplete(parsedData);
                }],
            params: searchParams
        });
        return new Promise(async (resolve) => resolve((await response).data));
    }
    GetFoodByUPC(parameters) {
        throw new Error('not implemented yet');
    }
}
exports.default = SpoonacularFoodAPI;
//# sourceMappingURL=SpoonacularFoodAPI.js.map