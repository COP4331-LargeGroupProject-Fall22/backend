import IImage from "../image/IImage";
import IIngredient from "../ingredient/IIngredient";
import IBaseRecipe from "./IBaseRecipe";

export default class UserBaseRecipe implements IBaseRecipe {
    id: number;
    name: string;
    image: IImage;
    ingredients: IIngredient[];
    isFavorite: boolean;
    hasAllergens: boolean;

    constructor(recipe: IBaseRecipe, isFavorite: boolean, hasAllergens: boolean) {
        this.id = recipe.id;
        this.image = recipe.image;
        this.name = recipe.name;
        this.ingredients = recipe.ingredients;
        this.isFavorite = isFavorite;
        this.hasAllergens = hasAllergens
    }
}
