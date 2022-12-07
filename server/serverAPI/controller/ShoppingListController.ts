import { ObjectID } from "bson";

import { Request, response, Response } from "express";
import { ResponseCodes } from "../../utils/ResponseCodes";

import IDatabase from "../../database/IDatabase";
import IIngredientAPI from "../../ingredientAPI/IIngredientAPI";
import IShoppingIngredient from "../model/internal/ingredient/IShoppingIngredient";
import IUser from "../model/internal/user/IUser";
import IUnit from "../model/internal/unit/IUnit";

import UnitSchema from "../model/internal/unit/UnitSchema";
import AddRequestSchema from "../model/external/requests/shoppingList/AddRequest";
import UpdateRequestSchema from "../model/external/requests/shoppingList/UpdateRequest";
import PriceSchema from "../model/internal/money/PriceSchema";
import ImageSchema from "../model/internal/image/ImageSchema";

import BaseIngredientController from "./BaseController/BaseIngredientController";
/**
 * This class creates several properties responsible for shopping list actions 
 * provided to the user.
 */
export default class ShoppingListController extends BaseIngredientController {
    private foodAPI: IIngredientAPI;

    constructor(database: IDatabase<IUser>, foodAPI: IIngredientAPI) {
        super(database);
        this.foodAPI = foodAPI;
    }

    protected sortByDate(collection: IShoppingIngredient[], isReverse: boolean): [string, IShoppingIngredient[]][] {
        // Sorts from earliest to latest date
        let items = collection.sort((a, b) => Number(a.dateAdded) - Number(b.dateAdded));

        let key = "Added first";

        if (isReverse) {
            key = "Added most recently";

            items.reverse();
        }

        return Array.from([[key, items]]);
    }

    protected sortByRecipe(collection: IShoppingIngredient[], isReverse: boolean): [string, IShoppingIngredient[]][] {
        let recipeMapById = new Map<string, IShoppingIngredient[]>();
        let recipeIdToNameMap = new Map<string, string>();

        let itemsWithoutRecipeID: IShoppingIngredient[] = [];

        /**
         * Divide collection on 2 collections.
         * 1 is a map where K,V => RecipeID, IShoppingIngredient[]
         * 2 is an array of all ingredients that don't have recipeID assigned to them 
        */
        collection.forEach(item => {
            if (item.recipeID) {
                let recipeIdAsString = item.recipeID.toString();

                if (!recipeMapById.has(recipeIdAsString)) {
                    recipeMapById.set(recipeIdAsString, []);
                    recipeIdToNameMap.set(recipeIdAsString, item.recipeName!);
                }

                recipeMapById.get(item.recipeID.toString())?.push(item);
            } else {
                itemsWithoutRecipeID.push(item);
            }
        });

        let items: [string, IShoppingIngredient[]][] = [];

        // Converts map to Array
        recipeMapById.forEach((value, key) => items.push([recipeIdToNameMap.get(key)!, value]));

        // Sorts collection of ingredients without recipe id in lexicographical order
        items.forEach(recipe => recipe[1].sort((a, b) => a.name.localeCompare(b.name)));
        itemsWithoutRecipeID.sort((a, b) => a.name.localeCompare(b.name));

        items.push(["N/A", itemsWithoutRecipeID]);

        if (isReverse) {
            items.reverse();
        }

        return items;
    }

    private async parseAddRequest(req: Request, res: Response): Promise<AddRequestSchema> {
        let recipeIdExist = req.body?.recipeID !== undefined;
        let recipeNameExist = req.body?.recipeName !== undefined;

        let recipeId: null | number = req.body?.recipeID !== undefined ? Number(req.body?.recipeID) : null;
        let recipeName: null | string = req.body?.recipeName !== undefined ? req.body?.recipeName : null;

        if (recipeIdExist !== recipeNameExist && !recipeIdExist !== !recipeNameExist) {
            return Promise.reject(this.send(ResponseCodes.BAD_REQUEST, res, "Both recipeID and recipeName should be provided"));
        }

        let request = new AddRequestSchema(
            Number(req.body?.id),
            req.body?.name,
            req.body?.category,
            req.body?.quantityUnits,
            new UnitSchema(req.body?.quantity?.unit, Number(req.body?.quantity?.value)),
            new ImageSchema(req.body?.image?.srcUrl),
            new PriceSchema(Number(req.body?.price), "US Cents"),
            Number(req.body?.dateAdded),
            recipeId,
            recipeName
        );

        request.itemID = new ObjectID().toHexString();

        return this.verifySchema(request, res);
    }

    private async parseUpdateRequest(req: Request, res: Response): Promise<UpdateRequestSchema> {
        let request = new UpdateRequestSchema(
            new UnitSchema(
                req.body?.unit,
                Number(req.body?.value)
            )
        );

        return this.verifySchema(request, res);
    }

    /**
     * Returns all food in user shopping list.
     * 
     * @param req Request parameter that holds information about request.
     * @param res Response parameter that holds information about response.
     */
    getAll = async (req: Request, res: Response) => {
        let parameters = new Map<string, any>([["username", req.serverUser.username]]);

        let sortByCategory = req.query.sortByCategory === 'true';
        let sortByLexicographicalOrder = req.query.sortByLexicographicalOrder === 'true';
        let sortByRecipe = req.query.sortByRecipe === 'true';
        let sortByDate = req.query.sortByDate === 'true'; 
        
        let truthyCount = 
            Number(sortByCategory) + Number(sortByLexicographicalOrder) +
            Number(sortByRecipe) + Number(sortByDate);

        if (truthyCount > 1) {
            return this.send(ResponseCodes.BAD_REQUEST, res, "Multiple sorting algorithms are not allowed.");
        }

        let isReverse = req.query.isReverse === 'true' ? true : false;

        let user: IUser;

        try {
            user = await this.requestGet(parameters, res)
        } catch (response) {
            return response;
        }

        let responseData: any = this.convertResponse(user.shoppingList);

        if (sortByRecipe) {
            responseData = this.sortByRecipe(user.shoppingList, isReverse);
        }

        if (sortByCategory) {
            responseData = this.sortByCategory(user.shoppingList, isReverse);
        }

        if (sortByLexicographicalOrder) {
            responseData = this.sortByLexicographicalOrder(user.shoppingList, isReverse);
        }

        if (sortByDate) {
            responseData = this.sortByDate(user.shoppingList, isReverse);
        }

        return this.send(ResponseCodes.OK, res, responseData);
    }

    private isEqual(src: IShoppingIngredient, target: AddRequestSchema): boolean {
        return src.id === target.id && src.recipeID === target.recipeID && src.recipeName === target.recipeName;
    }

    private getDuplicateShoppingItem(
        shoppingList: IShoppingIngredient[],
        ingredientItem: AddRequestSchema
    ): IShoppingIngredient | null {
        for (let i = 0; i < shoppingList.length; i++) {
            if (this.isEqual(shoppingList[i], ingredientItem)) {
                return shoppingList[i];
            }
        }

        return null;
    }

    /**
     * Adds food to user's shopping list.
     * 
     * @param req Request parameter that holds information about request.
     * @param res Response parameter that holds information about response.
     */
    add = async (req: Request, res: Response) => {
        let parameters = new Map<string, any>([["username", req.serverUser.username]]);

        let parsedRequest: AddRequestSchema;
        let user: IUser;

        try {
            parsedRequest = await this.parseAddRequest(req, res);
            user = await this.requestGet(parameters, res);
        } catch (response) {
            return response;
        }

        let duplicateItem = this.getDuplicateShoppingItem(user.shoppingList, parsedRequest)

        if (duplicateItem !== null) {
            for (let i = 0; i < user.shoppingList.length; i++) {
                if (this.isEqual(user.shoppingList[i], parsedRequest)) {
                    if (parsedRequest.recipeID !== null || parsedRequest.recipeName !== null) {
                        return this.send(
                            ResponseCodes.BAD_REQUEST,
                            res,
                            "Use update endpoint to change the amount of ingredient in the shopping list."
                        );
                    }

                    try {
                        user.shoppingList[i] = await this.updateIngredient(user.shoppingList[i], parsedRequest.quantity);
                    } catch (error) {
                        return this.send(ResponseCodes.BAD_REQUEST, res, this.getException(error));
                    }
                }
            }
        } else {
            user.shoppingList.push(parsedRequest);
        }

        let updatedUser = await this.requestUpdate(req.serverUser.username, user, res);

        return this.send(ResponseCodes.CREATED, res, updatedUser.shoppingList);
    }

    /**
     * Gets complete informations of the food item from user's shopping list.
     * 
     * @param req Request parameter that holds information about request
     * @param res Response parameter that holds information about response
     */
    get = async (req: Request, res: Response) => {
        let parameters = new Map<string, any>([["username", req.serverUser.username]]);

        let user: IUser;

        try {
            user = await this.requestGet(parameters, res)
        } catch (response) {
            return response;
        }

        let ingredient = user.shoppingList
            .find((foodItem: IShoppingIngredient) => foodItem.itemID === req.params.itemID);

        if (ingredient === undefined) {
            return this.send(ResponseCodes.NOT_FOUND, res, "Ingredient doesn't exist in shopping list.");
        }

        return this.send(ResponseCodes.OK, res, ingredient);
    }

    private async updateIngredient(existingItem: IShoppingIngredient, quantity: IUnit): Promise<IShoppingIngredient> {
        let amount = quantity;

        if (existingItem.quantity.unit !== quantity.unit) {
            let convertedUnit =
                await this.foodAPI.ConvertUnits(
                    quantity,
                    existingItem.quantity.unit,
                    existingItem.name
                );

            if (convertedUnit === null) {
                return Promise.reject("Amount units cannot be converted.");
            }

            amount = convertedUnit;
        }

        existingItem.quantity.value += amount.value;

        let updatedIngredient = await this.foodAPI.Get(new Map<string, any>([
            ["id", existingItem.id],
            ["quantity", existingItem.quantity.value],
            ["unit", existingItem.quantity.unit]
        ]));

        if (updatedIngredient === null) {
            return Promise.reject("Could not update ingredient.");
        }

        existingItem.price = updatedIngredient.price;

        return existingItem;
    }

    /**
     * Updates information of the food item from user's shopping list.
     * 
     * @param req Request parameter that holds information about request
     * @param res Response parameter that holds information about response
     */
    update = async (req: Request, res: Response) => {
        let parameters = new Map<string, any>([["username", req.serverUser.username]]);

        let parsedRequest: UpdateRequestSchema;
        let user: IUser;

        try {
            parsedRequest = await this.parseUpdateRequest(req, res);
            user = await this.requestGet(parameters, res);
        } catch (response) {
            return response;
        }

        let listHasItem: boolean = false;

        for (let i = 0; i < user.shoppingList.length; i++) {
            let existingIngredient = user.shoppingList[i];

            if (existingIngredient.itemID === req.params.itemID) {
                listHasItem = true;

                try {
                    user.shoppingList[i] = await this.updateIngredient(existingIngredient, parsedRequest.quantity);
                } catch (error) {
                    return this.send(ResponseCodes.BAD_REQUEST, res, this.getException(error));
                }
            }
        }

        if (!listHasItem) {
            return this.send(ResponseCodes.NOT_FOUND, res, "Use Add endpoint to add ingredient to the shopping list.");
        }

        let updatedUser = await this.requestUpdate(req.serverUser.username, user, res);

        return this.send(ResponseCodes.OK, res, updatedUser.shoppingList);
    }

    /**
     * Deletes food item from item from user's shopping list.
     * 
     * @param req Request parameter that holds information about request.
     * @param res Response parameter that holds information about response.
     */
    delete = async (req: Request, res: Response) => {
        let parameters = new Map<string, any>([["username", req.serverUser.username]]);

        let user: IUser;

        try {
            user = await this.requestGet(parameters, res)
        } catch (response) {
            return response;
        }

        let isFound: boolean = false;

        let shopingList: IShoppingIngredient[] = [];

        for (let i = 0; i < user.shoppingList.length; i++) {
            if (user.shoppingList[i].itemID === req.params.itemID) {
                isFound = true;
            } else {
                shopingList.push(user.shoppingList[i]);
            }
        }

        if (!isFound) {
            return this.send(ResponseCodes.NOT_FOUND, res, "Ingredient doesn't exist in shopping list.");
        }

        user.shoppingList = shopingList;

        let updatedUser = await this.requestUpdate(req.serverUser.username, user, res)
        return this.send(ResponseCodes.OK, res, updatedUser.shoppingList);
    }
}
