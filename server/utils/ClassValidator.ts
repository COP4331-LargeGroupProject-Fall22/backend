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
        registerDecorator({
            name: "WrongType",
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    return types.some(v => typeValidator[v](value, args));
                },
                defaultMessage(validationArguments?: ValidationArguments) {
                    const lastType = types.pop();
                    if (types.length == 0) {
                        return `${propertyName} has to be ${lastType}`;
                    }
                    
                    return `Can only be ${types.join(", ")} or ${lastType}.`;
                }
            }
        });
    };
}
