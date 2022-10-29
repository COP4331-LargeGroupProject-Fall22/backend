import IFood from "../food/IFood";
import IFoodItem from "../food/IFoodItem";
import IBaseRecipe from "../recipe/IBaseRecipe";
import IBaseUser from "./IBaseUser";

export default interface IUser extends IBaseUser {
    inventory: IFoodItem[];
    
    shopingList?: IFood[];

    favouriteRecipes?: IBaseRecipe[];
}
