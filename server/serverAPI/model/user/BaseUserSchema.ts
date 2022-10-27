import { IsInt, IsNotEmpty, IsPositive, IsString, ValidateNested } from "class-validator";
import IBaseUser from "./IBaseUser";

export default class BaseUserSchema implements IBaseUser {
    @IsNotEmpty()
    @IsString()
    firstName: string;
    
    @IsNotEmpty() 
    @IsString()
    lastName: string;

    @IsInt()
    @IsPositive()
    lastSeen: number;

    constructor(
        firstName: string,
        lastName: string,
    ) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.lastSeen = 1; 
    }
}