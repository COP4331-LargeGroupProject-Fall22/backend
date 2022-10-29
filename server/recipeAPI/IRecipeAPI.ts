import IBaseRecipe from "../serverAPI/model/recipe/IBaseRecipe";
import IRecipe from "../serverAPI/model/recipe/IRecipe";

export default interface IRecipeAPI {
    // TODO(#50): Rename query parameters for Get endpoints. 
    /**
     * Retrieves collection of partially filled Recipe items that satisfy searching parameters.
     * 
     * @param parameters parameters used for searching.
     * - query - required parameter that defines the name of the Recipe item (partial names are accepted).
     * - resultsPerPage - optional parameter that defines max number of the results to be returned.
     * - page - optional parameter that definds page number.     
     * - intolerances - optional parameter that defines the type of intolerances to be taken into consideration during searching.
     * - cuisine - optional parameter that limits search results to specific cuisines.
     * - mealType - optional parameter that limits search results to specific meal types.
     * 
     * @throws NoParameterFound exception when required parameters weren't found.
     * @returns Promise filled with a collection of Partial<IRecipe> objects.
     */
    GetAll(parameters: Map<string, any>): Promise<IBaseRecipe[]>;

    /**
     * Retrieves specific Recipe item that is defined by unique identifier.
     * 
     * @param parameters parameters used for searching.
     * - id - required parameter that defines unique identifier of the Recipe item.
     * 
     * @throws NoParameterFound exception when required parameters weren't found.
     * @returns Promise filled with a IRecipe object or null when Recipe item wasn't found.
     */
    Get(parameters: Map<string, any>): Promise<IRecipe | null>;
}
