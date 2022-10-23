"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ResponseTypes_1 = require("./ResponseTypes");
class ResponseFormatter {
    static formatAsJSON(type, data = null) {
        switch (type) {
            case ResponseTypes_1.ResponseTypes.ERROR:
                return {
                    status: false,
                    errors: data
                };
            case ResponseTypes_1.ResponseTypes.SUCCESS:
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
exports.default = ResponseFormatter;
//# sourceMappingURL=ResponseFormatter.js.map