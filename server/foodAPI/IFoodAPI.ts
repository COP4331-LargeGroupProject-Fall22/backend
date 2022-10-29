import IBaseFood from "../serverAPI/model/food/IBaseFood";
import IFood from "../serverAPI/model/food/IFood";

export default interface IFoodAPI {
    /**
     * Retrieves collection of food items that satisfy searching parameters.
     * 
     * @param parameters query parameters used for searching.
     * - query - required parameter that defines the name of the Food Item (partial names are accepted, not case sensitive).
     * - number - optional parameter that defines max number of the results to be returned.
     * - intolerance - optional parameter that defines the type of intolerences to be taken in consideration during searching.
     * Complete list of intolerences is available at https://spoonacular.com/food-api/docs#Intolerances 
     * 
     * @throws NoParameterFound exception when required parameters weren't found.
     * @returns Promise filled with an array of IFood objects.
     */
    SearchFood(parameters: Map<string, any>): Promise<IBaseFood[]>;

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
    GetFood(parameters: Map<string, any>): Promise<IFood | null>;

    /**
     * Retrieves food item that is specified by searching parameters.
     * 
     * @param parameters query parameters used for searching.
     * - upc - required parameter that defines UPC of the Food Item.
     * 
     * @throws IncorrectIDFormat exception when id has incorrect format.
     * @throws NoParameterFound exception when required parameters weren't found. 
     * @returns Promise filled with IFood object on successful search or null.
     */
    //TODO(#57): add support for UPC
    GetFoodByUPC(parameters: Map<string, any>): Promise<IFood | null>;
}
