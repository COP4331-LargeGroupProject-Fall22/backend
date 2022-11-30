import { IsEmail, IsInt, IsNotEmpty, IsNumber, IsPositive, IsString } from "class-validator";

import Schema from "../../Schema";

import IBaseUser from "./IBaseUser";
import ICredentials from "./ICredentials";

export default class BaseUserSchema extends Schema implements IBaseUser, ICredentials {
    @IsString()
    @IsNotEmpty()
    firstName: string;

    @IsString()
    @IsNotEmpty()
    lastName: string;

    @IsString()
    @IsNotEmpty()
    username: string;

    @IsString()
    @IsNotEmpty()
    password: string;

    @IsNumber()
    @IsPositive()
    @IsInt()
    lastSeen: number;

    @IsEmail()
    email: string;

    constructor(
        firstName: string,
        lastName: string,
        username: string,
        password: string,
        email: string,
        lastSeen: number
    ) {
        super();
        
        this.firstName = firstName;
        this.lastName = lastName;
        this.username = username;
        this.password = password;
        this.lastSeen = lastSeen;
        this.email = email;
    }
}
