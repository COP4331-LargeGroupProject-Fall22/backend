import axios from "axios";
import IncorrectIDFormat from "../../exceptions/IncorrectIDFormat";
import IncorrectSchema from "../../exceptions/IncorrectSchema";
import NoParameterFound from "../../exceptions/NoParameterFound";
import FoodSchema from "../../serverAPI/model/food/FoodSchema";
import IFood from "../../serverAPI/model/food/IFood";
import INutrient from "../../serverAPI/model/nutrients/INutrient";
import { Validator } from "../../utils/Validator";
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
            'intolerence'
        ]);

        this.foodInfoParameters = new Set([
            'amount',
            'unit'
        ])
    }

    /**
     * Converts parameters of getFoods method to URLSearchParams object.
     * 
     * @param parameters defined for the summary search.
     * 
     * @throws NoParameterFound exception when required parameters weren't found.
     * @returns URLSearchParams filled with parameters.
     */
    private convertFoodsParameters = (parameters: Map<String, any>): URLSearchParams => {
        let keys = Array.from(parameters.keys());

        let searchParams = new URLSearchParams();

        if (!parameters.has("query")) {
            throw new NoParameterFound("Query parameter is missing.");
        }

        keys.forEach(key => {
            if (this.foodSearchParameters.has(String(key))) {
                searchParams.append(String(key), String(parameters.get(key)));
            }
        });

        return searchParams;
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
    async GetFoods(parameters: Map<string, any>): Promise<Partial<IFood>[]> {
        let foodSearchBaseURL: string = process.env.SPOONACULAR_INGREDIENTS_BASE_URL + "/autocomplete";

        let searchParams = this.convertFoodsParameters(parameters);

        searchParams.append("apiKey", this.apiKey);
        searchParams.append("metaInformation", "true");

        let parseFood = this.parseFood;
        let converter = this.convertToFoodSchema;

        let response = axios.get(
            foodSearchBaseURL,
            {
                transformResponse: [function (data) {
                    let jsonObject = JSON.parse(data);

                    let partialFoods: Partial<IFood>[] = [];

                    jsonObject.forEach(async (object: any) => {
                        let parsedFood = await parseFood(object);
                        let foodSchema = await converter(parsedFood);

                        partialFoods.push({
                            id: foodSchema.id,
                            name: foodSchema.name,
                            category: foodSchema.category
                        });
                    });

                    return partialFoods;
                }],
                params: searchParams
            }
        );

        return new Promise(async (resolve) => resolve((await response).data));
    }

    /**
     * Parses plain javascript object as IFood object.
     * 
     * @param data representing food as plain javascript object.
     * @returns Promise filled with IFood object.
     */
    private parseFood = async (data: any): Promise<IFood> => {
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
     * Converts IFood object to FoodSchema object.
     * 
     * @param food IFood object.
     * @throws IncorrectSchema exception when food doesn't have correct format.
     * @returns Promise filled with FoodSchema on succss/
     */
    private async convertToFoodSchema(food: IFood): Promise<FoodSchema> {
        let foodSchema = new FoodSchema(
            food.id,
            food.name,
            food.category,
            food.nutrients
        );

        let logs = new Validator().validate(foodSchema);

        if ((await logs).length > 0) {
            throw new IncorrectSchema(`Unit object doesn't have correct format.\n${logs}`);
        }

        return foodSchema;
    }

    /**
    * Converts parameters of getFood method to URLSearchParams object.
    * 
    * @param parameters defined for the summary search.
    * @returns URLSearchParams filled with parameters.
    */
    private convertFoodParameters = (parameters: Map<String, any>): URLSearchParams => {
        let keys = Array.from(parameters.keys());

        let searchParams = new URLSearchParams();

        keys.forEach(key => {
            if (this.foodInfoParameters.has(String(key))) {
                searchParams.append(String(key), String(parameters.get(key)));
            }
        });

        return searchParams;
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
    GetFood(parameters: Map<string, any>): Promise<IFood | null> {
        if (!parameters.has("id")) {
            throw new NoParameterFound("id parameter is missing");
        }

        let foodID = Number.parseInt(parameters.get("id"));
        // id is not part of the query, therefore it should not be part of the parameters in URLSearch.
        parameters.delete("id");

        if (Number.isNaN(foodID) || foodID < 0) {
            throw new IncorrectIDFormat("FoodID has incorrect format.");
        }

        let foodGetInfoBaseURL: string = process.env.SPOONACULAR_INGREDIENTS_BASE_URL + `/${foodID}/information`;

        let searchParams = this.convertFoodParameters(parameters);

        if (!searchParams.has("amount")) {
            searchParams.set("amount", "1");
        }

        searchParams.append("apiKey", this.apiKey);

        let parseFood = this.parseFood;
        let converter = this.convertToFoodSchema;

        let response = axios.get(
            foodGetInfoBaseURL,
            {
                transformResponse: [async function (data) {
                    let jsonObject = JSON.parse(data);
                    let parsedFood = await parseFood(jsonObject);
                    let foodSchema = converter(parsedFood);

                    return foodSchema;
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
