export default class CustomException extends Error {
    constructor(
        message: string,
        name?: string
    ) {
        super();

        if (name !== undefined) {
            this.name = name;
        }

        if (message !== undefined) {
            this.message = message;
        }
    }
}