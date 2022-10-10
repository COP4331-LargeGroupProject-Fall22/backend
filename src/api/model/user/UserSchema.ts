import { IsEmail, IsInt, IsNotEmpty } from "class-validator";
import { IUser } from "./IUser";

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
