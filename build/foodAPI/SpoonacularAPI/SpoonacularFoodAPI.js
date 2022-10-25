"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const IncorrectIDFormat_1 = __importDefault(require("../../exceptions/IncorrectIDFormat"));
const IncorrectSchema_1 = __importDefault(require("../../exceptions/IncorrectSchema"));
const NoParameterFound_1 = __importDefault(require("../../exceptions/NoParameterFound"));
const FoodSchema_1 = __importDefault(require("../../serverAPI/model/food/FoodSchema"));
const Validator_1 = require("../../utils/Validator");
/**
 * This class implements IFoodAPI interface using Spoonacular API.
 */
class SpoonacularFoodAPI {
    constructor() {
        /**
         * Converts parameters of getFoods method to URLSearchParams object.
         *
         * @param parameters defined for the summary search.
         *
         * @throws NoParameterFound exception when required parameters weren't found.
         * @returns URLSearchParams filled with parameters.
         */
        this.convertFoodsParameters = (parameters) => {
            let keys = Array.from(parameters.keys());
            let searchParams = new URLSearchParams();
            if (!parameters.has("query")) {
                throw new NoParameterFound_1.default("Query parameter is missing.");
            }
            keys.forEach(key => {
                if (this.foodSearchParameters.has(String(key))) {
                    searchParams.append(String(key), String(parameters.get(key)));
                }
            });
            return searchParams;
        };
        /**
         * Parses plain javascript object as IFood object.
         *
         * @param data representing food as plain javascript object.
         * @returns Promise filled with IFood object.
         */
        this.parseFood = async (data) => {
            let id = data.id;
            let name = data.name;
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
        /**
        * Converts parameters of getFood method to URLSearchParams object.
        *
        * @param parameters defined for the summary search.
        * @returns URLSearchParams filled with parameters.
        */
        this.convertFoodParameters = (parameters) => {
            let keys = Array.from(parameters.keys());
            let searchParams = new URLSearchParams();
            keys.forEach(key => {
                if (this.foodInfoParameters.has(String(key))) {
                    searchParams.append(String(key), String(parameters.get(key)));
                }
            });
            return searchParams;
        };
        this.apiKey = process.env.SPOONACULAR_API_KEY;
        this.host = process.env.SPOONACULAR_HOST;
        this.headers = {
            "X-RapidAPI-Key": this.apiKey,
            "X-RapidAPI-Host": this.host
        },
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
    /**
     * Retrieves array of food items that satisfy searching parameters.
     *
     * @param parameters query parameters used for searching.
     * - query - required parameter that defines the name of the Food Item (partial names are accepted).
     * - number - optional parameter that defines max numbe of the results to be returned.
     * - intolerence - optional parameter that defines the type of intolerences to be taken in consideration during searching.
     * Complete list of intolerences is available at https://spoonacular.com/food-api/docs#Intolerances
     *
     * @throws NoParameterFound exception when required parameters weren't found.
     * @returns Promise filled with an array of IFood objects.
     */
    async GetFoods(parameters) {
        let foodSearchBaseURL = process.env.SPOONACULAR_INGREDIENTS_BASE_URL + "/autocomplete";
        let searchParams = this.convertFoodsParameters(parameters);
        searchParams.append("metaInformation", "true");
        let response = await axios_1.default.get(foodSearchBaseURL, {
            headers: this.headers,
            params: searchParams
        });
        let jsonArray = response.data;
        let partialFoods = [];
        for (let i = 0; i < jsonArray.length; i++) {
            let object = jsonArray[i];
            let parsedFood = await this.parseFood(object);
            let foodSchema = await this.convertToFoodSchema(parsedFood);
            partialFoods.push({
                id: foodSchema.id,
                name: foodSchema.name,
                category: foodSchema.category
            });
        }
        return partialFoods;
    }
    /**
     * Converts IFood object to FoodSchema object.
     *
     * @param food IFood object.
     * @throws IncorrectSchema exception when food doesn't have correct format.
     * @returns Promise filled with FoodSchema on succss/
     */
    async convertToFoodSchema(food) {
        let foodSchema = new FoodSchema_1.default(food.id, food.name, food.category, food.nutrients);
        let logs = new Validator_1.Validator().validate(foodSchema);
        if ((await logs).length > 0) {
            throw new IncorrectSchema_1.default(`Unit object doesn't have correct format.\n${logs}`);
        }
        return foodSchema;
    }
    /**
     * Retrieves food item that is specified by searching parameters.
     *
     * @param parameters query parameters used for searching.
     * - id - required parameter that defines unique identifier of the Food Item.
     * - amount - optional parameter that defines max number of the food items. (default = 1)
     *
     * @throws IncorrectIDFormat exception when id has incorrect format.
     * @throws NoParameterFound exception when required parameters weren't found.
     * @returns Promise filled with IFood object on successful search or null.
     */
    async GetFood(parameters) {
        if (!parameters.has("id")) {
            throw new NoParameterFound_1.default("id parameter is missing");
        }
        let foodID = Number.parseInt(parameters.get("id"));
        // id is not part of the query, therefore it should not be part of the parameters in URLSearch.
        parameters.delete("id");
        if (Number.isNaN(foodID) || foodID < 0) {
            throw new IncorrectIDFormat_1.default("FoodID has incorrect format.");
        }
        let foodGetInfoBaseURL = process.env.SPOONACULAR_INGREDIENTS_BASE_URL + `/${foodID}/information`;
        let searchParams = this.convertFoodParameters(parameters);
        if (!searchParams.has("amount")) {
            searchParams.set("amount", "1");
        }
        let response = await axios_1.default.get(foodGetInfoBaseURL, {
            headers: this.headers,
            params: searchParams
        });
        let jsonObject = response.data;
        let parsedFood = await this.parseFood(jsonObject);
        let foodSchema = this.convertToFoodSchema(parsedFood);
        return foodSchema;
    }
    GetFoodByUPC(parameters) {
        throw new Error('not implemented yet');
    }
}
exports.default = SpoonacularFoodAPI;
//# sourceMappingURL=SpoonacularFoodAPI.js.map