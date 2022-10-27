import IFoodItem from "../food/IFoodItem";
import IBaseUser from "./IBaseUser";

/**
 * User interface.
 */
export default interface ISensitiveUser extends IBaseUser {
    /**
     * Collection of IFoodItem representing user's inventory.
     */
    inventory: IFoodItem[];
}
