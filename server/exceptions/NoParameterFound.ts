export default class NoParameterFound extends Error {
    name!: string;
    message!: string;
    stack?: string | undefined;
    cause?: unknown;

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
