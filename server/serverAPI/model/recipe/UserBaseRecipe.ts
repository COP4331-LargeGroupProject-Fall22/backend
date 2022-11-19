import IImage from "../image/IImage";
import IBaseRecipe from "./IBaseRecipe";

export default class UserBaseRecipe implements IBaseRecipe {
    id: number;
    name: string;
    image: IImage;
    favorite: boolean;

    constructor(recipe: IBaseRecipe, favorite: boolean) {
        this.id = recipe.id;
        this.image = recipe.image;
        this.name = recipe.name;
        this.favorite = favorite;
    }
}
