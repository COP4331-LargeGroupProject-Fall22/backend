import { Blob } from "buffer";
import { validate } from "class-validator";

/**
 * This class validates information about object using custom validation methods as well as "class-validator" methods.
 */
export class Validator<Type extends object> {
    /**
     * This method validates object.
     * 
     * @param object object to be validated.
     * @returns Promise filled with array containing errors related to the validation (if those exist).
     */
    async validate(object: Type): Promise<Array<{ [type: string]: string }>> {
        let validationError = validate(object);

        return validationError.then(errors => {
            let logs: Array<{ [type: string]: string }> = [];

            if (errors.length > 0) {
                errors.forEach(error => logs.push(error.constraints!));
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
    async validateObjectId(id: string): Promise<Array<{ [type: string]: string }>> {
        let size = new Blob([id]).size;

        let logs: Array<{ [type: string]: string }> = [];
        
        if (size === 0) {
            logs.push({ isNotEmpty: "12 byte string should not be empty" });
        } else if (size !== 12 && id.length !== 24) {
            logs.push({ isNot12Byte: `${id} must be a 12 byte string or has 24 hex characters or be an integer`});
        }

        return Promise.resolve(logs);
    }
}
