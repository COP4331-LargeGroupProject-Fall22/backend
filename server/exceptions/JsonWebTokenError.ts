import CustomException from "./CustomException";

export default class JsonWebTokenError extends CustomException {
    constructor(
        message: string,
        name?: string
    ) {
        super(message, name);
    }
}
