import { IsInt, IsNotEmpty, IsPositive, IsString, ValidateNested } from "class-validator";
import IFoodItem from "../food/IFoodItem";
import BaseUserSchema from "./BaseUserSchema";
import ISensitiveUser from "./ISensitiveUser";

export default class SensitiveUserSchema extends BaseUserSchema implements ISensitiveUser {
    @ValidateNested()
    inventory: IFoodItem[];
    
    constructor(
        firstName: string,
        lastName: string,
    ) {
        super(firstName, lastName);

        this.inventory = [];
        this.firstName = firstName;
        this.lastName = lastName;
        this.lastSeen = 1; 
    }
}