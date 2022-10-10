import { IsEmail, IsInt, IsNotEmpty } from "class-validator";
import { IUser } from "./IUser";

export class UserSchema implements IUser {
    @IsNotEmpty()
    firstName: string;
    
    @IsNotEmpty() 
    lastName: string;
    
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    username: string;

    @IsNotEmpty()
    password: string;

    @IsInt()
    lastSeen: number;
    
    constructor(
        firstName: string,
        lastName: string,
        email: string,
        username: string,
        password: string
    ) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.username = username;
        this.password = password;
        this.lastSeen = 0; 
    }
}
