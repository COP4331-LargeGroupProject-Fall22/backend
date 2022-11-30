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
     * Recipe image.
     */
    readonly image: IImage;

    /**
     * Recipe ingredients.
     */
    readonly ingredients: T[]
}
