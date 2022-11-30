import { IsArray, ValidateNested } from "class-validator";
import IsType from "../../../../../utils/ClassValidator";

import IImage from "../../../internal/image/IImage";
import IUnit from "../../../internal/unit/IUnit";
import IShoppingIngredient from "../../../internal/ingredient/IShoppingIngredient";
import IPrice from "../../../internal/money/IPrice";

import BaseIngredientSchema from "../../../internal/ingredient/BaseIngredientSchema";

export default class AddRequestSchema extends BaseIngredientSchema implements IShoppingIngredient {
    itemID?: string;

    @ValidateNested()
    quantity: IUnit;

    @IsArray()
    quantityUnits: string[];

    @IsType(['null', 'positiveInt'])
    recipeID: number | null;

    @IsType(['null', 'string'])
    recipeName: string | null;

    @ValidateNested()
    price: IPrice;

    @IsType(['positiveInt'])
    dateAdded: number;
    
    constructor(
        id: number,
        name: string,
        category: string,
        quantityUnits: string[],
        quantity: IUnit,
        image: IImage,
        price: IPrice,
        dateAdded: number,
        recipeID: number | null,
        recipeName: string | null
    ) {
        super(id, name, category, image);
        
        this.quantityUnits = quantityUnits;
        this.quantity = quantity;
        this.recipeID = recipeID;
        this.dateAdded = dateAdded;
        this.recipeName = recipeName;
        this.price = price;
    }
}
