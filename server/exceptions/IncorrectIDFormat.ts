import CustomException from "./CustomException";

export default class IncorrectIDFormat extends CustomException {
    constructor(
        message: string,
        name?: string
    ) {
        super(message, name);
    }
}
