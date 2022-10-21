import { IsInt, IsNotEmpty, IsPositive, IsString, ValidateNested } from "class-validator";
import IFoodItem from "../food/IFoodItem";
import IUser from "./IUser";

/**
 * This class implements IUser interface and provides several built-in validations of its own properties.
 */
export default class UserSchema implements IUser {
    @IsNotEmpty()
    @IsString()
    firstName: string;
    
    @IsNotEmpty() 
    @IsString()
    lastName: string;
    
    @IsNotEmpty()
    @IsString()
    uid: string;

    @IsInt()
    @IsPositive()
    lastSeen: number;

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
