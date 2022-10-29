import CustomException from "./CustomException";

export default class ParameterIsNotAllowed extends CustomException {
    constructor(
        message: string,
        name?: string
    ) {
        super(message, name);
    }
}
