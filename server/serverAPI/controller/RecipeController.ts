import { Request, Response } from "express";
import { ResponseCodes } from "../../utils/ResponseCodes";

import IRecipeAPI from "../../recipeAPI/IRecipeAPI";

import BaseController from "./BaseController/BaseController";
import IBaseRecipe from "../model/internal/recipe/IBaseRecipe";
import IBaseIngredient from "../model/internal/ingredient/IBaseIngredient";
import PaginatedResponse from "../model/internal/paginatedResponse/PaginatedResponse";

/**
 * This class creates several properties responsible for authentication actions 
 * provided to the user.
 */
export default class RecipeController extends BaseController {
    private recipeAPI: IRecipeAPI;

    constructor(recipeAPI: IRecipeAPI) {
        super();
        this.recipeAPI = recipeAPI;
    }

    protected convertToResponse(
        response: PaginatedResponse<IBaseRecipe<IBaseIngredient>>,
        data: [string, IBaseRecipe<IBaseIngredient>[]][]
    ): any {
        return {
            currentPage: response.currentPage,
            numOfPages: response.numOfPages,
            numOfResults: response.numOfResults,
            results: data
        };
    }

    protected sortByCuisines<T extends PaginatedResponse<IBaseRecipe<IBaseIngredient>>>(
        collection: T,
        isReverse: boolean
    ): [string, IBaseRecipe<IBaseIngredient>[]][] {
        let itemMap = new Map<string, IBaseRecipe<IBaseIngredient>[]>();

        // Divides collection on map where K,V => Category,T[]
        collection.results.forEach(item => {
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

    protected sortByDiets<T extends PaginatedResponse<IBaseRecipe<IBaseIngredient>>>(
        collection: T,
        isReverse: boolean
    ): [string, IBaseRecipe<IBaseIngredient>[]][] {
        let itemMap = new Map<string, IBaseRecipe<IBaseIngredient>[]>();

        // Divides collection on map where K,V => Category,T[]
        collection.results.forEach(item => {
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

    protected sortByMealTypes<T extends PaginatedResponse<IBaseRecipe<IBaseIngredient>>>(
        collection: T,
        isReverse: boolean
    ): [string, IBaseRecipe<IBaseIngredient>[]][] {
        let itemMap = new Map<string, IBaseRecipe<IBaseIngredient>[]>();

        // Divides collection on map where K,V => Category,T[]
        collection.results.forEach(item => {
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

    protected sortByLexicographicalOrder<T extends PaginatedResponse<IBaseRecipe<IBaseIngredient>>>(
        collection: T,
        isReverse: boolean
    ): [string, IBaseRecipe<IBaseIngredient>[]][] {
        let itemMap = new Map<string, IBaseRecipe<IBaseIngredient>[]>();

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

    /**
     * Lets client to search recipes using specified parameters provided in the URL.
     * Upon successful operation, this handler will return recipe items. 
     * 
     * @param req Request parameter that holds information about request
     * @param res Response parameter that holds information about response
     */
    getAll = async (req: Request, res: Response) => {
        let parameters = new Map<string, any>();

        if (req.query?.recipeName !== undefined) {
            parameters.set("recipeName", req.query.recipeName);
        }

        if (req.query?.page !== undefined) {
            parameters.set("page", req.query.page);
        }

        if (req.query?.resultsPerPage !== undefined) {
            parameters.set("resultsPerPage", req.query.resultsPerPage);
        }

        if (req.query?.intolerence !== undefined) {
            parameters.set("intolerance", req.query.intolerance);
        }

        if (req.query?.hasIngredients !== undefined) {
            parameters.set("hasIngredients", req.query.hasIngredients);
        }

        if (req.query?.cuisines !== undefined) {
            parameters.set("cuisines", req.query.cuisines);
        }

        if (req.query?.diets !== undefined) {
            parameters.set("diets", req.query.diets);
        }

        if (req.query?.mealTypes !== undefined) {
            parameters.set("mealTypes", req.query.mealTypes);
        }

        let sortByMealTypes = req.query.sortByMealTypes === 'true';
        let sortByDiets = req.query.sortByDiets === 'true';
        let sortByCuisines = req.query.sortByCuisines === 'true';
        let sortByLexicographicalOrder = req.query.sortByLexicographicalOrder === 'true';

        let truthyCount = Number(sortByMealTypes) + Number(sortByDiets) + Number(sortByLexicographicalOrder) + Number(sortByCuisines);

        if (truthyCount > 1) {
            return this.send(ResponseCodes.BAD_REQUEST, res, "Multiple sorting algorithms are not allowed.");
        }

        let isReverse = req.query.isReverse === 'true' ? true : false;

        let getResponse: PaginatedResponse<IBaseRecipe<IBaseIngredient>>;
        try {
            getResponse = await this.recipeAPI.GetAll(parameters);

        } catch (error) {
            return this.send(ResponseCodes.BAD_REQUEST, res, this.getException(error));
        }

        let responseData: [string, IBaseRecipe<IBaseIngredient>[]][] = this.convertResponse(getResponse.results);

        if (sortByCuisines) {
            responseData = this.sortByCuisines(getResponse, isReverse);
        }

        if (sortByDiets) {
            responseData = this.sortByDiets(getResponse, isReverse);
        }

        if (sortByMealTypes) {
            responseData = this.sortByMealTypes(getResponse, isReverse);
        }

        if (sortByLexicographicalOrder) {
            responseData = this.sortByLexicographicalOrder(getResponse, isReverse);
        }

        return this.send(ResponseCodes.OK, res, this.convertToResponse(getResponse, responseData));
    }

    /**
     * Gets information about specific recipe using specified parameters provided in the URL.
     * 
     * @param req Request parameter that holds information about request
     * @param res Response parameter that holds information about response
     */
    get = async (req: Request, res: Response) => {
        let parameters = new Map<string, any>([
            ["id", req.params.recipeID]
        ]);

        return this.recipeAPI.Get(parameters).then(recipe => {
            if (recipe === null) {
                return this.send(ResponseCodes.NOT_FOUND, res, "Recipe could not be found.");
            }

            return this.send(ResponseCodes.OK, res, recipe);
        }, (error) => this.send(ResponseCodes.BAD_REQUEST, res, this.getException(error)));
    }
}
