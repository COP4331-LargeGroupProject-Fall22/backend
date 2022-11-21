import IImage from "../image/IImage";
import IIngredient from "../ingredient/IIngredient";

export default interface IBaseRecipe {
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
    readonly ingredients: IIngredient[]
}
