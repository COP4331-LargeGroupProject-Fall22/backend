import { IsInt, IsNotEmpty, IsPositive, IsString, ValidateNested } from "class-validator";
import IFoodItem from "../food/IFoodItem";
import IInternalUser from "./IInternalUser";
import ISensitiveUser from "./ISensitiveUser";

/**
 * This class implements IUser interface and provides several built-in validations of its own properties.
 */
export default class InternalUserSchema implements IInternalUser {
    @IsNotEmpty()
    @IsString()
    firstName: string;
    
    @IsNotEmpty() 
    @IsString()
    lastName: string;

    @IsInt()
    @IsPositive()
    lastSeen: number;

    @IsNotEmpty()
    @IsString()
    uid: string;

    @ValidateNested()
    inventory: IFoodItem[];
    
    constructor(
        firstName: string,
        lastName: string,
        uid: string
    ) {
        this.inventory = [];
        this.firstName = firstName;
        this.lastName = lastName;
        this.uid = uid;
        this.lastSeen = 1; 
    }
}
