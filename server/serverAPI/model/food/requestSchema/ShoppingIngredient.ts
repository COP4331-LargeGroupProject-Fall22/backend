import { validate, ValidateNested } from "class-validator";
import INutrient from "../../nutrients/INutrient";
import IUnit from "../../unit/IUnit";
import IngredientSchema from "./IngredientSchema";
import IShoppingIngredient from "../IShoppingIngredient";

export default class ShoppingIngredientSchema extends IngredientSchema implements IShoppingIngredient {
    @ValidateNested()
    quantity: IUnit;

    recipeID?: number;

    constructor(
        id: number,
        name: string,
        category: string,
        nutrients: INutrient[],
        quantityUnits: string[],
        quantity: IUnit,
        recipeID?: number
    ) {
        super(id, name, category, nutrients, quantityUnits);
        
        this.quantity = quantity;
        this.recipeID = recipeID;
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
