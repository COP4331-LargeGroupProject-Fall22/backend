import IImage from "../image/IImage";

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
}
