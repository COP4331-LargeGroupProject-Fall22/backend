import { IsNumber, IsPositive } from "class-validator";
import IInventoryIngredient from "../IInventoryIngredient";
import BaseIngredientSchema from "./IngredientSchema";

export default class InventoryIngredientSchema extends BaseIngredientSchema implements IInventoryIngredient {
    @IsNumber()
    @IsPositive()
    expirationDate: number;

    constructor(
        id: number,
        name: string,
        category: string,
        quantityUnits: string[],
        expirationDate: number
    ) {
        super(id, name, category, quantityUnits);
        this.expirationDate = expirationDate;
    }
}
