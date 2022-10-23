"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Validator = void 0;
const buffer_1 = require("buffer");
const class_validator_1 = require("class-validator");
/**
 * This class validates information about object using custom validation methods as well as "class-validator" methods.
 */
class Validator {
    /**
     * This method validates object.
     *
     * @param object object to be validated.
     * @returns Promise filled with array containing errors related to the validation (if those exist).
     */
    async validate(object) {
        let validationError = (0, class_validator_1.validate)(object);
        return validationError.then(errors => {
            let logs = [];
            if (errors.length > 0) {
                errors.forEach(error => logs.push(error.constraints));
            }
            return Promise.resolve(logs);
        });
    }
    /**
     * This method validates ObjectId represented as a string.
     *
     * @param id objectId represented as a tring.
     * @returns Promise filled with array containing errors related to the validation (if those exist).
     */
    async validateObjectId(id) {
        let size = new buffer_1.Blob([id]).size;
        let logs = [];
        if (size === 0) {
            logs.push({ isNotEmpty: "12 byte string should not be empty" });
        }
        else if (size !== 12 && id.length !== 24) {
            logs.push({ isNot12Byte: `${id} must be a 12 byte string or has 24 hex characters or be an integer` });
        }
        return Promise.resolve(logs);
    }
}
exports.Validator = Validator;
//# sourceMappingURL=Validator.js.map