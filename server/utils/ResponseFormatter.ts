import { ResponseTypes } from "./ResponseTypes";

export default class ResponseFormatter {
    static formatAsJSON(type: ResponseTypes, data: any = null): any {
        switch (type) {
            case ResponseTypes.ERROR:
                return {
                    status: false,
                    errors: data
                };
            case ResponseTypes.SUCCESS:
                return {
                    status: true,
                    data: data
                };

            default:
                return {
                    status: true
                };
        }
    }
}