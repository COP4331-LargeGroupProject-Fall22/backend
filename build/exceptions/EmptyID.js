"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class EmptyID extends Error {
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
exports.default = EmptyID;
//# sourceMappingURL=EmptyID.js.map