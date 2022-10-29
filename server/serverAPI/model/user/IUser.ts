import IIngredient from "../food/IIngredient";
import IInventoryIngredient from "../food/IInventoryIngredient";
import IBaseRecipe from "../recipe/IBaseRecipe";
import IBaseUser from "./IBaseUser";
import ICredentials from "./ICredentials";

export default interface IUser extends IBaseUser, ICredentials {
    inventory: IInventoryIngredient[];
    
    shopingList?: IIngredient[];

    favouriteRecipes?: IBaseRecipe[];
}
