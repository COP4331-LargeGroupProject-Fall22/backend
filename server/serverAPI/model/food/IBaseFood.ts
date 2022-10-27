export default interface IBaseFood {
    /**
     * Unique food identifier.
     */
    readonly id: number;

    /**
     * Food name.
     */
    readonly name: string;

    /**
     * Food category.
     */
    readonly category: string;
}