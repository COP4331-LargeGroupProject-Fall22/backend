import IBaseIngredient from "../ingredient/IBaseIngredient";
import IInventoryIngredient from "../ingredient/IInventoryIngredient";
import IShoppingIngredient from "../ingredient/IShoppingIngredient";
import IBaseRecipe from "../recipe/IBaseRecipe";
import IUser from "./IUser";

import BaseUserSchema from "./BaseUserSchema";

export default class UserSchema extends BaseUserSchema implements IUser {

    isVerified: boolean;
    
    inventory: IInventoryIngredient[];
    
    shoppingList: IShoppingIngredient[];
    
    allergens: IBaseIngredient[];
    
    favoriteRecipes: IBaseRecipe<IBaseIngredient>[];

    constructor(
        firstName: string,
        lastName: string,
        username: string,
        password: string,
        email: string,
        lastSeen: number
    ) {
        super(firstName, lastName, username, password, email, lastSeen);
        
        this.isVerified = false;
        this.inventory = [];
        this.shoppingList = [];
        this.allergens = []
        this.favoriteRecipes = [];
    }
}
