import IImage from "../image/IImage";
import IInventoryIngredient from "../ingredient/IInventoryIngredient";
import IShoppingIngredient from "../ingredient/IShoppingIngredient";
import IBaseRecipe from "../recipe/IBaseRecipe";
import IBaseUser from "./IBaseUser";
import IContactInformation from "./IContactInformation";
import ICredentials from "./ICredentials";

export default interface IUser extends IBaseUser, ICredentials, IContactInformation {
    isVerified: boolean;

    image?: IImage;

    inventory: IInventoryIngredient[];
    
    shoppingList: IShoppingIngredient[];

    favoriteRecipes?: IBaseRecipe[];
}
