import CustomException from "./CustomException";

export default class IncorrectSchema extends CustomException {
    constructor(
        message: string,
        name?: string
    ) {
        super(message, name);
    }
}
