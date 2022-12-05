import IImage from "../image/IImage";
import IBaseIngredient from "../ingredient/IBaseIngredient";
import IIngredient from "../ingredient/IIngredient";
import IBaseRecipe from "./IBaseRecipe";

export default class UserBaseRecipe implements IBaseRecipe<IBaseIngredient> {
    id: number;
    name: string;
    image: IImage;
    cuisines: string[];
    diets: string[];
    mealTypes: string[];
    ingredients: IBaseIngredient[];
    isFavorite: boolean;
    hasAllergens: boolean;

    constructor(recipe: IBaseRecipe<IBaseIngredient>, isFavorite: boolean, hasAllergens: boolean) {
        this.id = recipe.id;
        this.image = recipe.image;
        this.name = recipe.name;
        this.cuisines = recipe.cuisines;
        this.diets = recipe.diets;
        this.mealTypes = recipe.mealTypes;
        this.ingredients = recipe.ingredients;
        this.isFavorite = isFavorite;
        this.hasAllergens = hasAllergens
    }

}
