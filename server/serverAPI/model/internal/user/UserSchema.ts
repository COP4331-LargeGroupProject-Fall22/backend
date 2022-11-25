import { validate } from "class-validator";
import IBaseIngredient from "../ingredient/IBaseIngredient";
import IInventoryIngredient from "../ingredient/IInventoryIngredient";
import IShoppingIngredient from "../ingredient/IShoppingIngredient";
import IBaseRecipe from "../recipe/IBaseRecipe";
import IUser from "./IUser";
import BaseUserSchema from "./requestSchema/BaseUserSchema";

export default class UserSchema extends BaseUserSchema implements IUser {

    isVerified: boolean;
    
    inventory: IInventoryIngredient[];
    
    shoppingList: IShoppingIngredient[];
    
    allergens: IBaseIngredient[];
    
    favoriteRecipes: IBaseRecipe[];

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

    async validate(): Promise<{ [type: string]: string; }[]> {
        let validationError = validate(this);

        const errors = await validationError;

        let logs: Array<{ [type: string]: string; }> = [];
        if (errors.length > 0) {
            errors.forEach(error => logs.push(error.constraints!));
        }

        return await Promise.resolve(logs);
    }
}
