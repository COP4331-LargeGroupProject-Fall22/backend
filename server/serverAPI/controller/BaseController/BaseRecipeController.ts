import IBaseIngredient from "../../model/internal/ingredient/IBaseIngredient";
import PaginatedResponse from "../../model/internal/paginatedResponse/PaginatedResponse";
import IBaseRecipe from "../../model/internal/recipe/IBaseRecipe";
import BaseController from "./BaseController";

export default class BaseRecipeController extends BaseController {
    public convertToPaginatedResponse(
        paginatedRecipes: PaginatedResponse<IBaseRecipe<IBaseIngredient>>,
        convertedResponse: [string, IBaseRecipe<IBaseIngredient>[]][]
    ): any {
        return {
            currentPage: paginatedRecipes.currentPage,
            numOfPages: paginatedRecipes.numOfPages,
            numOfResults: paginatedRecipes.numOfResults,
            results: convertedResponse
        };
    }

    public sortByCuisines<T extends IBaseRecipe<IBaseIngredient>>(
        paginatedRecipes: PaginatedResponse<T>,
        isReverse: boolean
    ): [string, T[]][] {
        let itemMap = new Map<string, T[]>();

        // Divides collection on map where K,V => Category,T[]
        paginatedRecipes.results.forEach(item => {
            item.cuisines.forEach(cuisine => {
                if (!itemMap.has(cuisine)) {
                    itemMap.set(cuisine, []);
                }

                itemMap.get(cuisine)?.push(item);
            });
        });

        // Converts map to array and sorts it based on the category name in lexicographical order
        let items = Array.from(itemMap.entries()).sort((a, b) => a[0].localeCompare(b[0]));

        // Sorts each collection related to category in lexicographical order
        items.forEach(item => {
            item[1].sort((a, b) => a.name.localeCompare(b.name))
        });

        if (isReverse) {
            items.reverse();
        }

        return items;
    }

    public sortByDiets<T extends IBaseRecipe<IBaseIngredient>>(
        paginatedRecipes: PaginatedResponse<T>,
        isReverse: boolean
    ): [string, T[]][] {
        let itemMap = new Map<string, T[]>();

        // Divides collection on map where K,V => Category,T[]
        paginatedRecipes.results.forEach(item => {
            item.diets.forEach(diet => {
                if (!itemMap.has(diet)) {
                    itemMap.set(diet, []);
                }

                itemMap.get(diet)?.push(item);
            });
        });

        // Converts map to array and sorts it based on the category name in lexicographical order
        let items = Array.from(itemMap.entries()).sort((a, b) => a[0].localeCompare(b[0]));

        // Sorts each collection related to category in lexicographical order
        items.forEach(item => {
            item[1].sort((a, b) => a.name.localeCompare(b.name))
        });

        if (isReverse) {
            items.reverse();
        }

        return items;
    }

    public sortByMealTypes<T extends IBaseRecipe<IBaseIngredient>>(
        paginatedRecipes: PaginatedResponse<T>,
        isReverse: boolean
    ): [string, T[]][] {
        let itemMap = new Map<string, T[]>();

        // Divides collection on map where K,V => Category,T[]
        paginatedRecipes.results.forEach(item => {
            item.mealTypes.forEach(mealType => {
                if (!itemMap.has(mealType)) {
                    itemMap.set(mealType, []);
                }

                itemMap.get(mealType)?.push(item);
            });
        });

        // Converts map to array and sorts it based on the category name in lexicographical order
        let items = Array.from(itemMap.entries()).sort((a, b) => a[0].localeCompare(b[0]));

        // Sorts each collection related to category in lexicographical order
        items.forEach(item => {
            item[1].sort((a, b) => a.name.localeCompare(b.name))
        });

        if (isReverse) {
            items.reverse();
        }

        return items;
    }

    public sortByLexicographicalOrder<T extends IBaseRecipe<IBaseIngredient>>(
        collection: PaginatedResponse<T>,
        isReverse: boolean
    ): [string, T[]][] {
        let itemMap = new Map<string, T[]>();

        collection.results.forEach((item) => {
            let firstLetter = item.name.charAt(0).toLocaleUpperCase();

            if (!itemMap.has(firstLetter)) {
                itemMap.set(firstLetter, []);
            }

            itemMap.get(firstLetter)?.push(item);
        });

        let items = Array.from(itemMap.entries()).sort((a, b) => a[0].localeCompare(b[0]));

        items.forEach((item) => item[1].sort((a, b) => a.name.localeCompare(b.name)));

        if (isReverse) {
            items.reverse();
        }

        return items;
    }
}
