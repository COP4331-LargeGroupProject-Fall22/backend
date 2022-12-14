import IBaseIngredient from "../serverAPI/model/internal/ingredient/IBaseIngredient";
import PaginatedResponse from "../serverAPI/model/internal/paginatedResponse/PaginatedResponse";
import IBaseRecipe from "../serverAPI/model/internal/recipe/IBaseRecipe";
import IRecipe from "../serverAPI/model/internal/recipe/IRecipe";

export default interface IRecipeAPI {
    /**
     * Retrieves collection of partially filled Recipe items that satisfy searching parameters.
     * 
     * @param parameters parameters used for searching.
     * - recipeName - required parameter that defines the name of the Recipe item (partial names are accepted).
     * - resultsPerPage - optional parameter that defines max number of the results to be returned. (default = 100)
     * - page - optional parameter that definds page number. (default = 1)
     * - intolerances - optional parameter that defines the type of intolerances to be taken into consideration during searching. (default = none)
     * > Complete list of intolerances is available at https://spoonacular.com/food-api/docs#Intolerances 
     * - cuisine - optional parameter that limits search results to specific cuisines. (default = none)
     * > Complete list of cusines is available at https://spoonacular.com/food-api/docs#Cuisines
     * - mealTypes - optional parameter that limits search results to specific meal types. (default = none)
     * > Complete list of mealTypes is available at https://spoonacular.com/food-api/docs#Meal-Types
     * - hasIngredients - optional parameter that constrains search result to recipes that contains specified ingredients.
     * (ingredient list should be represented as comma separated ingredient names)
     * - diets - optional parameter that limits search results to recipes that conform to the specified diets.
     * > Complete list of ditest is available at https://spoonacular.com/food-api/docs#Diets
     * 
     * @throws NoParameterFound exception when required parameters weren't found.
     * @returns Promise filled with a collection of Partial<IRecipe> objects.
     */
    GetAll(parameters: Map<string, any>): Promise<PaginatedResponse<IBaseRecipe<IBaseIngredient>> | null>;

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
