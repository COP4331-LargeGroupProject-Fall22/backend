import { ResponseTypes } from "./ResponseTypes";

/**
 * This class is responsible for providing implementation for formatting depending on different resonse types.
 */
export default class ResponseFormatter {
    static formatAsJSON(type: ResponseTypes, data: any = null): any {
        switch (type) {
            case ResponseTypes.ERROR:
                return data;
            case ResponseTypes.SUCCESS:
                return data;
        }
    }
}
