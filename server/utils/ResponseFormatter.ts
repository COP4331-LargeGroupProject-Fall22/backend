import { ResponseTypes } from "./ResponseTypes";

/**
 * This class is responsible for providing implementation for formatting depending on different resonse types.
 */
export default class ResponseFormatter {
    static formatAsJSON(data: any = {}): any {
        return data;
    }
}
