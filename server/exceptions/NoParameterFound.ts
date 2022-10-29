import CustomException from "./CustomException";

export default class NoParameterFound extends CustomException {
    constructor(
        message: string,
        name?: string
    ) {
        super(message, name);
    }
}
