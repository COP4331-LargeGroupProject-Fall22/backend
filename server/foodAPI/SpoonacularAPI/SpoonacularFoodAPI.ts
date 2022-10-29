import IncorrectIDFormat from "../../exceptions/IncorrectIDFormat";
import IncorrectSchema from "../../exceptions/IncorrectSchema";
import NoParameterFound from "../../exceptions/NoParameterFound";
import FoodSchema from "../../serverAPI/model/food/FoodSchema";
import IBaseFood from "../../serverAPI/model/food/IBaseFood";
import IFood from "../../serverAPI/model/food/IFood";
import INutrient from "../../serverAPI/model/nutrients/INutrient";
import SpoonacularAPI from "../../spoonacularUtils/SpoonacularAPI";
import { Validator } from "../../utils/Validator";
import IFoodAPI from "../IFoodAPI";

/**
 * This class implements IFoodAPI interface using Spoonacular API.
 */
export default class SpoonacularFoodAPI extends SpoonacularAPI implements IFoodAPI {
    private foodSearchParameters: Set<string>;
    private foodInfoParameters: Set<string>;

    constructor(apiKey: string, apiHost: string) {
        super(apiKey, apiHost);

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
     * @throws RequestLimitReached excpetion when request limit has been reached.
     * @returns Promise filled with an array of IFood objects.
     */
    async SearchFood(parameters: Map<string, any>): Promise<IBaseFood[]> {
        let foodSearchBaseURL: string = process.env.SPOONACULAR_INGREDIENTS_BASE_URL + "/autocomplete";

        let searchParams = this.convertFoodsParameters(parameters);

        searchParams.append("metaInformation", "true");

        let response = await this.sendRequest(foodSearchBaseURL, searchParams);

        if (response === null) {
            return Promise.resolve([]);
        }

        let jsonArray = response;
        let partialFoods: IBaseFood[] = [];

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
     * @returns Promise filled with FoodSchema on success.
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
            throw new IncorrectSchema(`Food object doesn't have correct format.\n ${JSON.stringify(await logs)}`);
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
    async GetFood(parameters: Map<string, any>): Promise<IFood | null> {
        if (!parameters.has("id")) {
            throw new NoParameterFound("id parameter is missing");
        }

        let foodID = Number.parseInt(parameters.get("id"));
        // id is not part of the query, therefore it should not be part of the parameters in URLSearch.
        parameters.delete("id");

        if (Number.isNaN(foodID) || foodID <= 0) {
            throw new IncorrectIDFormat("FoodID has incorrect format.");
        }

        let foodGetInfoBaseURL: string = process.env.SPOONACULAR_INGREDIENTS_BASE_URL + `/${foodID}/information`;

        let searchParams = this.convertFoodParameters(parameters);

        if (!searchParams.has("amount")) {
            searchParams.set("amount", "1");
        }

        let response = await this.sendRequest(foodGetInfoBaseURL, searchParams);

        if (response == null) {
            return Promise.resolve(null);
        }

        let jsonObject = response;
        let parsedFood = await this.parseFood(jsonObject);
        let foodSchema = this.convertToFoodSchema(parsedFood);

        return foodSchema;
    }

    // TODO(#57): add support for upc
    GetFoodByUPC(parameters: Map<string, any>): Promise<IFood | null> {
        throw new Error('not implemented yet');
    }
}
