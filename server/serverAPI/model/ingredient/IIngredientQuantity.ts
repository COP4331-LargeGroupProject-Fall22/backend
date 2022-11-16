import IUnit from "../unit/IUnit";

export default interface IIngredientQuantity {
    /**
     * Quantity of the food.
     */
    quantity: IUnit;
    
    /**
     * Units describing food's quantity.
     */
    quantityUnits: string[];
}