import IsType from "../../../../utils/ClassValidator";

import IPrice from "./IPrice";

import Schema from "../../Schema";

export default class PriceSchema extends Schema implements IPrice {
    @IsType(['positiveNumber'])
    price: number;

    @IsType(['string'])
    currency: string;

    constructor(price: number, currency: string) {
        super();

        this.price = price;
        this.currency = currency;    
    }
}
