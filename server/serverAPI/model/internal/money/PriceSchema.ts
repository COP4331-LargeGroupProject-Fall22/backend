import { validate } from "class-validator";
import IsType from "../../../../utils/ClassValidator";
import ISchema from "../../ISchema";
import IPrice from "./IPrice";

export default class PriceSchema implements ISchema, IPrice {
    @IsType(['positiveNumber'])
    price: number;

    @IsType(['string'])
    currency: string;

    constructor(price: number, currency: string) {
        this.price = price;
        this.currency = currency;    
    }

    async validate(): Promise<{ [type: string]: string; }[]> {
        let validationError = validate(this);

        const errors = await validationError;

        let logs: Array<{ [type: string]: string; }> = [];
        if (errors.length > 0) {
            errors.forEach(error => logs.push(error.constraints!));
        }

        return await Promise.resolve(logs);
    }
}
