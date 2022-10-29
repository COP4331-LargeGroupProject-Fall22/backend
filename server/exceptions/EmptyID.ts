import CustomException from "./CustomException";

export default class EmptyID extends CustomException {
    constructor(
        message: string,
        name?: string
    ) {
        super(message, name);
    }
}
