import { isInt, isNumber, isString, registerDecorator, ValidationArguments, ValidationOptions } from "class-validator";

const typeValidator = {
    'undefined': function (value: any, args: ValidationArguments) {
        return typeof value === 'undefined';
    },
    'positiveInt': function (value: any, args: ValidationArguments) {
        return isNumber(value, {
            allowNaN: false,
            allowInfinity: false
        }) && isInt(value);
    },
    'positiveFloat': function (value: any, args: ValidationArguments) {
        return isNumber(value, {
            allowNaN: false,
            allowInfinity: false
        }) && !isInt(value);
    },
    'positiveNumber': function (value: any, args: ValidationArguments) {
        return isNumber(value, {
            allowNaN: false,
            allowInfinity: false
        });
    },
    'null': function (value: any, args: ValidationArguments) {
        return value === null;
    },
    'string': function (value: any, args: ValidationArguments) {
        return isString(value);
    }
};

export default function IsType(types: (keyof (typeof typeValidator))[], validationOptions?: ValidationOptions) {

    return function (object: Object, propertyName: string) {
        let typesDuplicate = [...types];
        let typesOriginal = [...types];

        registerDecorator({
            name: "WrongType",
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    return typesDuplicate.some(v => typeValidator[v](value, args));
                },
                defaultMessage(validationArguments?: ValidationArguments) {
                    const lastType = typesDuplicate.pop();

                    let errorMessage = typesDuplicate.length === 0 ?
                        `${propertyName} has to be ${lastType}` : `Can only be ${typesDuplicate.join(", ")} or ${lastType}.`;

                    typesDuplicate = [...typesOriginal];
                    
                    return errorMessage;
                }
            }
        });
    };
}
