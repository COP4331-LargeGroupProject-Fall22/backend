"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class IncorrectSchema extends Error {
    constructor(message, name) {
        super();
        if (name !== undefined) {
            this.name = name;
        }
        if (message !== undefined) {
            this.message = message;
        }
    }
}
exports.default = IncorrectSchema;
//# sourceMappingURL=IncorrectSchema.js.map