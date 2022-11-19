import { ObjectID } from "bson";
import { Request, Response } from "express";
import IDatabase from "../../database/IDatabase";
import IIngredientAPI from "../../ingredientAPI/IIngredientAPI";
import { ResponseCodes } from "../../utils/ResponseCodes";
import IShoppingIngredient from "../model/ingredient/IShoppingIngredient";
import ShoppingIngredientSchema from "../model/ingredient/requestSchema/ShoppingIngredientSchema";
import UnitSchema from "../model/unit/UnitSchema";
import IUser from "../model/user/IUser";
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

    protected sortByRecipe(collection: IShoppingIngredient[]): any {
        let recipeMap = new Map<string, IShoppingIngredient[]>();

        let itemsWithoutRecipeID: IShoppingIngredient[] = [];

        collection.forEach(item => {
            if (item.recipeID) {
                if (!recipeMap.has(item.recipeID.toString())) {
                    recipeMap.set(item.recipeID.toString(), []);
                }

                recipeMap.get(item.recipeID.toString())?.push(item);
            } else {
                itemsWithoutRecipeID.push(item);
            }
        });

        let recipes = Array.from(recipeMap.entries()).sort((a, b) => a[0].localeCompare(b[0]));

        recipes.forEach(recipe => {
            recipe[1].sort((a, b) => a.name.localeCompare(b.name))
        });

        return {
            itemsWithRecipeID: Object.fromEntries(recipes),
            itemsWithoutRecipeID: itemsWithoutRecipeID
        };
    }

    private async parseAddRequest(req: Request, res: Response)
        : Promise<IShoppingIngredient> {
        let jsonPayload = req.body;
        let ingredientSchema = new ShoppingIngredientSchema(
            Number.parseInt(jsonPayload.id),
            jsonPayload.name,
            jsonPayload.category,
            jsonPayload.quantityUnits,
            jsonPayload.quantity,
            jsonPayload.recipeID === undefined ? null : jsonPayload.recipeID
        );

        ingredientSchema.itemID = new ObjectID().toHexString();

        try {
            ingredientSchema = await this.verifySchema(ingredientSchema, res);
        } catch (response) {
            return Promise.reject(response);
        }

        return ingredientSchema;
    }

    private async parseUpdateRequest(req: Request, res: Response, existingIngredient: IShoppingIngredient)
        : Promise<IShoppingIngredient> {
        let ingredientSchema = new ShoppingIngredientSchema(
            existingIngredient.id,
            existingIngredient.name,
            existingIngredient.category,
            existingIngredient.quantityUnits,
            existingIngredient.quantity,
            existingIngredient.recipeID
        );

        ingredientSchema.itemID = existingIngredient.itemID;

        if (!this.isStringUndefinedOrEmpty(req.body.quantity)) {
            let quantityObject = req.body.quantity;

            let quantitySchema = new UnitSchema(
                quantityObject.unit,
                Number.parseFloat(quantityObject.value)
            );

            try {
                await this.verifySchema(quantitySchema, res);
                ingredientSchema.quantity = quantitySchema;
            } catch (response) {
                return Promise.reject(response);
            }
        }

        return ingredientSchema;
    }

    /**
     * Returns all food in user shopping list.
     * 
     * @param req Request parameter that holds information about request.
     * @param res Response parameter that holds information about response.
     */
    getAll = async (req: Request, res: Response) => {
        let parameters = new Map<string, any>([["username", req.serverUser.username]]);

        let isReverse = req.query.isReverse === 'true' ? true : false;

        let user: IUser;

        try {
            user = await this.requestGet(parameters, res)
        } catch (response) {
            return response;
        }

        let responseData: any = user.shoppingList;

        if (req.query.sortByRecipe === 'true') {
            responseData = this.sortByRecipe(user.shoppingList);
        }

        if (req.query.sortByCategory === 'true') {
            responseData = this.sortByCategory(user.shoppingList, isReverse);
        }

        if (req.query.sortByLexicographicalOrder === 'true') {
            responseData = this.sortByLexicographicalOrder(user.shoppingList, isReverse);
        }

        return this.send(ResponseCodes.OK, res, responseData);
    }

    private isEqual(src: IShoppingIngredient, target: IShoppingIngredient): boolean {
        return src.id === target.id && src.recipeID === target.recipeID;
    }

    private getDuplicateShoppingItem(
        shoppingList: IShoppingIngredient[],
        ingredientItem: IShoppingIngredient
    ): IShoppingIngredient | null {
        for (let i = 0; i < shoppingList.length; i++) {
            if (this.isEqual(shoppingList[i], ingredientItem)) {
                return shoppingList[i];
            }
        }

        return null;
    }

    private async updateShoppingItem(
        shoppingList: IShoppingIngredient[],
        newShoppingItem: IShoppingIngredient,
        res: Response
    ): Promise<boolean> {
        for (let i = 0; i < shoppingList.length; i++) {
            if (this.isEqual(shoppingList[i], newShoppingItem)) {
                if (newShoppingItem.recipeID !== null) {
                    return Promise.reject(
                        this.send(
                            ResponseCodes.BAD_REQUEST,
                            res, "Use update endpoint to change the amount of ingredient in the shopping list.")
                    );
                }

                let amount = newShoppingItem.quantity;

                if (shoppingList[i].quantity.unit !== newShoppingItem.quantity.unit) {
                    let convertedUnit =
                        await this.foodAPI.ConvertUnits(
                            newShoppingItem.quantity,
                            shoppingList[i].quantity.unit,
                            shoppingList[i].name
                        );

                    if (convertedUnit === null) {
                        return Promise.reject(this.send(ResponseCodes.BAD_REQUEST, res, "Amount units cannot be converted."));
                    }

                    amount = convertedUnit;
                }

                shoppingList[i].quantity.value += amount.value;

                return true;
            }
        }

        return false;
    }

    /**
     * Adds food to user's shopping list.
     * 
     * @param req Request parameter that holds information about request.
     * @param res Response parameter that holds information about response.
     */
    add = async (req: Request, res: Response) => {
        let parameters = new Map<string, any>([["username", req.serverUser.username]]);

        let user: IUser;

        try {
            user = await this.requestGet(parameters, res);
        } catch (response) {
            return response;
        }

        let ingredientSchema = await this.parseAddRequest(req, res);

        let duplicateItem = this.getDuplicateShoppingItem(user.shoppingList, ingredientSchema)

        if (duplicateItem !== null) {
            try {
                this.updateShoppingItem(user.shoppingList, ingredientSchema, res);
            } catch (response) {
                return response;
            }
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

    /**
     * Updates information of the food item from user's shopping list.
     * 
     * @param req Request parameter that holds information about request
     * @param res Response parameter that holds information about response
     */
    update = async (req: Request, res: Response) => {
        let parameters = new Map<string, any>([["username", req.serverUser.username]]);

        let user: IUser;

        try {
            user = await this.requestGet(parameters, res);
        } catch (response) {
            return response;
        }

        let listHasItem: boolean = false;

        for (let i = 0; i < user.shoppingList.length; i++) {
            let existingIngredient = user.shoppingList[i];

            if (existingIngredient.itemID === req.params.itemID) {
                listHasItem = true;

                let ingredient = await this.parseUpdateRequest(req, res, existingIngredient);
                user.shoppingList[i] = ingredient;
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
