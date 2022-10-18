import { IsInt, IsNotEmpty } from "class-validator";
import { IUser } from "./IUser";

/**
 * This class implements IUser interface and provides several built-in validations of its own properties.
 */
export class UserSchema implements IUser {
    @IsNotEmpty()
    firstName: string;
    
    @IsNotEmpty() 
    lastName: string;
    
    @IsNotEmpty()
    uid: string;

    @IsInt()
    lastSeen: number;
    
    constructor(
        firstName: string,
        lastName: string,
        uid: string
    ) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.uid = uid;
        this.lastSeen = 0; 
    }
}
