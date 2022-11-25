import IInventoryIngredient from "../IInventoryIngredient";
import BaseIngredientSchema from "./BaseIngredientSchema";
import IsType from "../../../../../utils/ClassValidator";
import IImage from "../../image/IImage";

export default class InventoryIngredientSchema extends BaseIngredientSchema implements IInventoryIngredient {
    @IsType(['null', 'positiveInt'])
    expirationDate: number | null;

    constructor(
        id: number,
        name: string,
        category: string,
        image: IImage,
        expirationDate: number | null = null
    ) {
        super(id, name, category, image);
        this.expirationDate = expirationDate;
    }
}
