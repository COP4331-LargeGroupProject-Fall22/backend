import IImage from "../image/IImage";
import IBaseRecipe from "./IBaseRecipe";

export default class UserBaseRecipe implements IBaseRecipe {
    id: number;
    name: string;
    image: IImage;
    isFavorite: boolean;

    constructor(recipe: IBaseRecipe, isFavorite: boolean) {
        this.id = recipe.id;
        this.image = recipe.image;
        this.name = recipe.name;
        this.isFavorite = isFavorite;
    }
}
