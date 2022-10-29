import IRecipe from "../serverAPI/model/recipe/IRecipe";

export default interface IRecipeAPI {
     /**
     * Retrieves collection of partially filled Recipe items that satisfy searching parameters.
     * 
     * @param parameters parameters used for searching.
     * - recipeName - required parameter that defines the name of the Recipe item (partial names are accepted).
     * - number - optional parameter that defines max number of the results to be returned.
     * - page - optional parameter that defines page number for pagination.
     * - intolerance - optional parameter that defines the type of intolerances to be taken in consideration during searching.
     * 
     * @throws NoParameterFound exception when required parameters weren't found.
     * @returns Promise filled with a collection of Partial<IRecipe> objects.
     */
    SearchRecipe(parameters: Map<string, any>): Promise<Partial<IRecipe>[]>;

    /**
     * Retrieves specific Recipe item that is defined by unique identifier.
     * 
     * @param parameters parameters used for searching.
     * - id - required parameter that defines unique identifier of the Recipe item.
     * 
     * @throws NoParameterFound exception when required parameters weren't found.
     * @returns Promise filled with a IRecipe object or null when Recipe item wasn't found.
     */
    GetRecipe(parameters: Map<string, any>): Promise<IRecipe | null>;
}
