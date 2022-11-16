export default class Random {
    /**
     *  Generates random number in the provided range.
     * 
     * @param min number in the range
     * @param max number in the range
     * @returns random number in the [min, max] range.
     */
    static getRandomIntInRange(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}
