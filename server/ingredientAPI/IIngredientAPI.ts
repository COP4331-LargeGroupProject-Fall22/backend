import IBaseIngredient from "../serverAPI/model/internal/ingredient/IBaseIngredient";
import IIngredient from "../serverAPI/model/internal/ingredient/IIngredient";
import PaginatedResponse from "../serverAPI/model/internal/paginatedResponse/PaginatedResponse";
import IUnit from "../serverAPI/model/internal/unit/IUnit";

export default interface IIngredientAPI {
    /**
     * Retrieves collection of ingredient items that satisfy searching parameters.
     * 
     * @param parameters query parameters used for searching.
     * - ingredientName - required parameter that defines the name of the ingredient Item (partial names are accepted).
     * - resultsPerPage - optional parameter that defines max number of the results to be returned. (default = 100)
     * - page - optional parameter that definds page number. (default = 1)
     * - intolerance - optional parameter that defines the type of intolerances to be taken in consideration during searching. (default = none)
     * > Complete list of intolerences is available at https://spoonacular.com/food-api/docs#Intolerances 
     * 
     * @throws NoParameterFound exception when required parameters weren't found.
     * @returns Promise filled with an array of Iingredient objects.
     */
    GetAll(parameters: Map<string, any>): Promise<PaginatedResponse<IBaseIngredient> | null>;

    /**
     * Retrieves ingredient item that is specified by searching parameters.
     * 
     * @param parameters query parameters used for searching.
     * - id - required parameter that defines unique identifier of the ingredient Item.
     * - quantity - optional parameter that defines the amount of that ingredient items. (default = 1)
     * - unit - optional parameter that defines the unit for given amount. (default = serving)
     * 
     * @throws IncorrectIDFormat exception when id has incorrect format.
     * @throws NoParameterFound exception when required parameters weren't found. 
     * @returns Promise filled with Iingredient object on successful search or null.
     */
    Get(parameters: Map<string, any>): Promise<IIngredient | null>;


    /**
     * Retrieves food item that is specified by searching parameters.
     * 
     * @param oldAmount - old amount of food item.
     * @param targetUnit - target unit to which oldAmount will be converted to.
     * @param ingrdientName - name of the ingredient used in conversion.
     * @returns Promise filled with IUnit object on successful search or null.
     */
    ConvertUnits(oldAmount: IUnit, targetUnit: string, ingredientName: string): Promise<IUnit | null>;

    // TODO(#57): add support for UPC
    GetByUPC(parameters: Map<string, any>): Promise<IIngredient | null>;
}
