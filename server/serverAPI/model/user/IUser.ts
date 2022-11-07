import IIngredient from "../ingredient/IIngredient";
import IInventoryIngredient from "../ingredient/IInventoryIngredient";
import IShoppingIngredient from "../ingredient/IShoppingIngredient";
import IBaseRecipe from "../recipe/IBaseRecipe";
import IBaseUser from "./IBaseUser";
import IContactInformation from "./IContactInformation";
import ICredentials from "./ICredentials";

export default interface IUser extends IBaseUser, ICredentials, IContactInformation {
    inventory: IInventoryIngredient[];
    
    shoppingCart: IShoppingIngredient[];

    favoriteRecipes?: IBaseRecipe[];
}
