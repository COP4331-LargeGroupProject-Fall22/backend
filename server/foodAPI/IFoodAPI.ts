import IBaseIngredient from "../serverAPI/model/food/IBaseIngredient";
import IIngredient from "../serverAPI/model/food/IIngredient";

export default interface IFoodAPI {
    /**
     * Retrieves collection of food items that satisfy searching parameters.
     * 
     * @param parameters query parameters used for searching.
     * - query - required parameter that defines the name of the Food Item (partial names are accepted).
     * - resultsPerPage - optional parameter that defines max number of the results to be returned.
     * - page - optional parameter that definds page number.
     * - intolerance - optional parameter that defines the type of intolerances to be taken in consideration during searching.
     * Complete list of intolerences is available at https://spoonacular.com/food-api/docs#Intolerances 
     * 
     * @throws NoParameterFound exception when required parameters weren't found.
     * @returns Promise filled with an array of IFood objects.
     */
    GetAll(parameters: Map<string, any>): Promise<IBaseIngredient[] | null>;

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
    Get(parameters: Map<string, any>): Promise<IIngredient | null>;

    GetByUPC(parameters: Map<string, any>): Promise<IIngredient | null>;
}
