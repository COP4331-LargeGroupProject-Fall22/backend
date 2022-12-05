import IImage from "../image/IImage";
import IBaseIngredient from "../ingredient/IBaseIngredient";

export default interface IBaseRecipe<T extends IBaseIngredient> {
    /**
     * Unique recipe identifier.
     */
    readonly id: number;

    /**
     * Recipe name.
     */
    readonly name: string;

    /**
     * Collection of cuisines to which recipe belongs.
     */
    readonly cuisines: string[];

    /**
     * Collection of diets to which recipe belongs.
     */
    readonly diets: string[];

    /**
     * Type of the dish that is going to be cooked. e.g. main dish, dessert etc.
     */
    readonly mealTypes: string[];

    /**
     * Recipe image.
     */
    readonly image: IImage;

    /**
     * Recipe ingredients.
     */
    readonly ingredients: T[]
}
