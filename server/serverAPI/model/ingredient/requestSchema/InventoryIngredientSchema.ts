import IInventoryIngredient from "../IInventoryIngredient";
import BaseIngredientSchema from "./BaseIngredientSchema";
import IsType from "../../../../utils/ClassValidator";

export default class InventoryIngredientSchema extends BaseIngredientSchema implements IInventoryIngredient {
    @IsType(['null', 'positiveInt'])
    expirationDate: number | null;

    constructor(
        id: number,
        name: string,
        category: string,
        expirationDate: number | null = null
    ) {
        super(id, name, category);
        this.expirationDate = expirationDate;
    }
}
