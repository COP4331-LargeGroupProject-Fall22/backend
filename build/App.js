"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.server = exports.app = void 0;
/**
 * Entry point of the Food API.
 * This file is responsible for setting up server and routing api request to their respective routes.
 */
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const Logger_1 = __importDefault(require("./serverAPI/middleware/logger/Logger"));
const UserRoutes_1 = require("./serverAPI/routes/UserRoutes");
const AuthenticationRoutes_1 = require("./serverAPI/routes/AuthenticationRoutes");
const FoodRoute_1 = require("./serverAPI/routes/FoodRoute");
const app = (0, express_1.default)();
exports.app = app;
app.use(Logger_1.default.consoleLog);
app.use(express_1.default.static(path_1.default.resolve(__dirname, './serverAPI/view/html/public')));
if (process.env.NODE_ENV === 'production') {
    app.use(express_1.default.static('frontend/build'));
    app.get('*', (req, res) => {
        res.sendFile(path_1.default.resolve(__dirname, 'frontend', 'build', 'index.html'));
    });
}
app.use('/users', UserRoutes_1.userRoute);
app.use('/foods', FoodRoute_1.foodRoute);
app.use('/auth', AuthenticationRoutes_1.authenticationRoute);
const server = (port) => {
    app.listen(port, () => {
        console.log(`🚀 Server is running on port ${port}`);
    });
};
exports.server = server;
//# sourceMappingURL=App.js.map