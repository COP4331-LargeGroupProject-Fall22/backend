import IFoodItem from "../food/IFoodItem";

/**
 * User interface.
 */
export interface IUser {
    firstName: string;
    lastName: string;
    uid: string;
    lastSeen: number;
    inventory: IFoodItem[];
}
