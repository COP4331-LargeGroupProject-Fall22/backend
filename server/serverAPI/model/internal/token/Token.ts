export default class Token {
    token: string;
    generationDate: number;
    lifespanInSeconds: number;
    expirationDate: number;

    constructor(
        token: string,
        generationDate: number,
        lifespanInSeconds: number,
        expirationDate: number
    ) {
        this.token = token;
        this.generationDate = generationDate;
        this.lifespanInSeconds = lifespanInSeconds;
        this.expirationDate = expirationDate;
    }
}
