import { IsNotEmpty, IsNumber, IsPositive, IsString } from "class-validator";
import IUnit from "./IUnit";

export default class UnitSchema implements IUnit {
    @IsNotEmpty()
    @IsString()
    readonly unit: string;

    @IsNotEmpty()
    @IsPositive()
    @IsNumber()
    readonly value: number;
    
    constructor(
        unit: string,
        value: number
    ) {
        this.unit = unit;
        this.value = value;
    }
}
