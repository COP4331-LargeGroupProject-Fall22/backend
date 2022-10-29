import IFoodItem from "../food/IFoodItem";
import IBaseUser from "./IBaseUser";

/**
 * User interface.
 */
export default interface ISensitiveUser extends IBaseUser {
    /**
     * User identifier on the server.
     */
    id?: string;

    /**
     * Collection of IFoodItem representing user's inventory.
     */
    inventory: IFoodItem[];

    // TODO(#53): Add shopping list
    // TODO(#54): Add favorite recipes list
}
