import { isInt, isNumber, registerDecorator, ValidateNested, ValidationArguments, ValidationOptions } from "class-validator";


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
    'null': function (value: any, args: ValidationArguments) {
        return value === null;
    }
};

export default function IsType(types: (keyof (typeof typeValidator))[], validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: "wrongType",
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
                        return `Has to be ${lastType}`;
                    }
                    
                    return `Can only be ${types.join(", ")} or ${lastType}.`;
                }
            }
        });
    };
}
