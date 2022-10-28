import { IsInt, IsNotEmpty, IsNumber, IsPositive, IsString, validate } from "class-validator";
import ISchema from "../ISchema";
import IBaseUser from "../IBaseUser";
import IUserCredentials from "../IUserCredentials";

export default class UserRegistrationSchema implements IUserCredentials, IBaseUser, ISchema {
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

    constructor(
        firstName: string,
        lastName: string,
        username: string,
        password: string,
        lastSeen: number
    ) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.username = username;
        this.password = password;
        this.lastSeen = lastSeen;
    }

    async validate(): Promise<{ [type: string]: string; }[]> {
        let validationError = validate(this);

        const errors = await validationError;

        let logs: Array<{ [type: string]: string; }> = [];
        if (errors.length > 0) {
            errors.forEach(error => logs.push(error.constraints!));
        }

        return await Promise.resolve(logs);
    }
}