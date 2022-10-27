import { IsInt, IsNotEmpty, IsPositive, IsString, ValidateNested } from "class-validator";
import IFoodItem from "../food/IFoodItem";
import IInternalUser from "./IInternalUser";
import ISensitiveUser from "./ISensitiveUser";
import SensitiveUserSchema from "./SensitiveUserSchema";

/**
 * This class implements IUser interface and provides several built-in validations of its own properties.
 */
export default class InternalUserSchema extends SensitiveUserSchema implements IInternalUser{
    @IsNotEmpty()
    @IsString()
    uid: string;
    
    constructor(
        firstName: string,
        lastName: string,
        uid: string
    ) {
        super(firstName, lastName)

        this.inventory = [];
        this.firstName = firstName;
        this.lastName = lastName;
        this.uid = uid;
        this.lastSeen = 1; 
    }
}
