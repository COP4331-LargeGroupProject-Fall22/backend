"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Validator_1 = require("../../utils/Validator");
const UserSchema_1 = __importDefault(require("../model/user/UserSchema"));
const FoodItemSchema_1 = __importDefault(require("../model/food/FoodItemSchema"));
const NutrientSchema_1 = __importDefault(require("../model/nutrients/NutrientSchema"));
const UnitSchema_1 = __importDefault(require("../model/unit/UnitSchema"));
const ResponseFormatter_1 = __importDefault(require("../../utils/ResponseFormatter"));
const ResponseTypes_1 = require("../../utils/ResponseTypes");
/**
 * This class creates several properties responsible for user-actions
 * provided to the user.
 */
class UserController {
    constructor(database) {
        /**
         * Lets client to get information about all users existed on the server.
         * Upon successful operation, this handler will return all users (including their non-sensitive information) existed on the server.
         *
         * @param req Request parameter that holds information about request
         * @param res Response parameter that holds information about response
         */
        this.getUsers = async (req, res) => {
            this.database.GetUsers()
                .then((users) => res.status(200).json(ResponseFormatter_1.default.formatAsJSON(ResponseTypes_1.ResponseTypes.SUCCESS, users)));
        };
        /**
         * Lets client to get information about user at specified userID.
         * Upon successful operation, this handler will return complete information about specific user only if uid of the user with accessToken and uid of the
         * user at userID are the same.
         *
         * @param req Request parameter that holds information about request
         * @param res Response parameter that holds information about response
         */
        this.getUser = async (req, res) => {
            let userID = req.params.userID;
            const validator = new Validator_1.Validator();
            let logs = await validator.validateObjectId(userID);
            if (logs.length > 0) {
                res.status(400).json(ResponseFormatter_1.default.formatAsJSON(ResponseTypes_1.ResponseTypes.ERROR, logs));
                return;
            }
            let parameters = new Map([
                ["_id", userID]
            ]);
            let user = await this.database.GetUser(parameters);
            if (user === null) {
                res.status(404).json(ResponseFormatter_1.default.formatAsJSON(ResponseTypes_1.ResponseTypes.ERROR, "User hasn't been found."));
                return;
            }
            // if (user.uid !== req.params.uid) {
            //     res.status(400).json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, "Cannot access other people information."));
            //     return;
            // }
            res.status(200).json(ResponseFormatter_1.default.formatAsJSON(ResponseTypes_1.ResponseTypes.SUCCESS, user));
        };
        /**
         * Lets client to update information of the user at specified userID.
         * Upon successful operation, this handler will return updated user object only if uid of the user with accessToken and uid of the
         * user at userID are the same.
         *
         * @param req Request parameter that holds information about request
         * @param res Response parameter that holds information about response
         */
        this.updateUser = async (req, res) => {
            let userID = req.params.userID;
            const newUser = new UserSchema_1.default(req.body?.firstName, req.body?.lastName, req.body?.uid);
            const validator = new Validator_1.Validator();
            let logs = (await validator.validate(newUser))
                .concat(await validator.validateObjectId(userID));
            if (logs.length > 0) {
                res.status(400).json(ResponseFormatter_1.default.formatAsJSON(ResponseTypes_1.ResponseTypes.ERROR, logs));
                return;
            }
            let parameters = new Map([
                ["_id", userID]
            ]);
            let user = await this.database.GetUser(parameters);
            if (user === null) {
                res.status(404).json(ResponseFormatter_1.default.formatAsJSON(ResponseTypes_1.ResponseTypes.ERROR, "User hasn't been found."));
                return;
            }
            // if (user.uid !== req.params.uid) {
            //     res.status(400).json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, "Cannot access other people information."));
            //     return;
            // }
            newUser.inventory = user.inventory;
            let updatedUser = await this.database.UpdateUser(userID, newUser);
            res.status(200).json(ResponseFormatter_1.default.formatAsJSON(ResponseTypes_1.ResponseTypes.SUCCESS, updatedUser));
        };
        /**
         * Lets client to delete user object at specified userID.
         * Upon successful operation, this handler will delete user object only if uid of the user with accessToken and uid of the
         * user at userID are the same.
         *
         * @param req Request parameter that holds information about request
         * @param res Response parameter that holds information about response
         */
        this.deleteUser = async (req, res) => {
            let userID = req.params.userID;
            const validator = new Validator_1.Validator();
            let logs = await validator.validateObjectId(userID);
            if (logs.length > 0) {
                res.status(400).json(ResponseFormatter_1.default.formatAsJSON(ResponseTypes_1.ResponseTypes.ERROR, logs));
                return;
            }
            let user = await this.database.GetUser(new Map([["_id", userID]]));
            if (user === null) {
                res.status(404).json(ResponseFormatter_1.default.formatAsJSON(ResponseTypes_1.ResponseTypes.ERROR, "User hasn't been found."));
                return;
            }
            // if (user.uid !== req.params.uid) {
            //     res.status(400).json(ResponseFormatter.formatAsJSON(ResponseTypes.ERROR, "Cannot access other people information."));
            //     return;
            // }
            let result = await this.database.DeleteUser(userID);
            if (!result) {
                res.status(404).json(ResponseFormatter_1.default.formatAsJSON(ResponseTypes_1.ResponseTypes.ERROR, "Delete was unsuccessful."));
                return;
            }
            res.status(200).json(ResponseFormatter_1.default.formatAsJSON(ResponseTypes_1.ResponseTypes.SUCCESS));
        };
        /**
         * Lets client to get all foods in user's inventory where user is at specified userID.
         * Upon successful operation, this handler will return all food items in user's inventory.
         *
         * @param req Request parameter that holds information about request
         * @param res Response parameter that holds information about response
         */
        this.getFoods = async (req, res) => {
            let userID = req.params.userID;
            const validator = new Validator_1.Validator();
            let logs = await validator.validateObjectId(userID);
            if (logs.length > 0) {
                res.status(400).json(ResponseFormatter_1.default.formatAsJSON(ResponseTypes_1.ResponseTypes.ERROR, logs));
                return;
            }
            let parameters = new Map([
                ["_id", userID]
            ]);
            let user = await this.database.GetUser(parameters);
            if (user === null) {
                res.status(404).json(ResponseFormatter_1.default.formatAsJSON(ResponseTypes_1.ResponseTypes.ERROR, "User hasn't been found."));
                return;
            }
            res.status(200).json(ResponseFormatter_1.default.formatAsJSON(ResponseTypes_1.ResponseTypes.SUCCESS, user.inventory));
        };
        /**
        * Lets client to add food to user's inventory where user is at specified userID.
        * Upon successful operation, this handler will return all food items from user's inventory.
        *
        * @param req Request parameter that holds information about request
        * @param res Response parameter that holds information about response
        */
        this.addFood = async (req, res) => {
            let userID = req.params.userID;
            if (req.body.nutrients == undefined) {
                res.status(404).json(ResponseFormatter_1.default.formatAsJSON(ResponseTypes_1.ResponseTypes.ERROR, "Nutrition is not part of the payload."));
                return;
            }
            let parsedNutrients = JSON.parse(req.body.nutrients);
            let nutrients = [];
            parsedNutrients.forEach((nutrient) => {
                nutrients.push(new NutrientSchema_1.default(nutrient?.name, new UnitSchema_1.default(nutrient?.unit?.unit, nutrient?.unit?.value), nutrient?.percentOfDaily));
            });
            const newFood = new FoodItemSchema_1.default(Number.parseInt(req.body.id), req.body.name, req.body.category, nutrients, Number.parseFloat(req.body.expirationDate));
            const validator = new Validator_1.Validator();
            let logs = (await validator.validateObjectId(userID))
                .concat(await validator.validate(newFood));
            if (logs.length > 0) {
                res.status(400).json(ResponseFormatter_1.default.formatAsJSON(ResponseTypes_1.ResponseTypes.ERROR, logs));
                return;
            }
            let parameters = new Map([
                ["_id", userID]
            ]);
            let user = await this.database.GetUser(parameters);
            if (user === null) {
                res.status(404).json(ResponseFormatter_1.default.formatAsJSON(ResponseTypes_1.ResponseTypes.ERROR, "User hasn't been found"));
                return;
            }
            let food = user.inventory.find((foodItem) => foodItem.id === newFood.id);
            if (food !== undefined) {
                res.status(400).json(ResponseFormatter_1.default.formatAsJSON(ResponseTypes_1.ResponseTypes.ERROR, "Food item already exists in inventory"));
                return;
            }
            user.inventory.push(newFood);
            let updatedUser = await this.database.UpdateUser(userID, user);
            if (updatedUser === null) {
                res.status(400).json(ResponseFormatter_1.default.formatAsJSON(ResponseTypes_1.ResponseTypes.ERROR, "Food item could not be added. User update error."));
                return;
            }
            res.status(200).json(ResponseFormatter_1.default.formatAsJSON(ResponseTypes_1.ResponseTypes.SUCCESS, updatedUser.inventory));
        };
        /**
         * Lets client to get complete informations of the food item from user's inventory where user is at specified userID.
         * Upon successful operation, this handler will return food item from user's inventory.
        *
        * @param req Request parameter that holds information about request
        * @param res Response parameter that holds information about response
        */
        this.getFood = async (req, res) => {
            let userID = req.params.userID;
            let foodID = req.params.foodID;
            const validator = new Validator_1.Validator();
            let logs = await validator.validateObjectId(userID);
            if (logs.length > 0) {
                res.status(400).json(ResponseFormatter_1.default.formatAsJSON(ResponseTypes_1.ResponseTypes.ERROR, logs));
                return;
            }
            let parameters = new Map([
                ["_id", userID]
            ]);
            let user = await this.database.GetUser(parameters);
            if (user === null) {
                res.status(404).json(ResponseFormatter_1.default.formatAsJSON(ResponseTypes_1.ResponseTypes.ERROR, "User hasn't been found."));
                return;
            }
            let foodItem = user.inventory.find((foodItem) => foodItem.id === Number.parseInt(foodID));
            if (foodItem === undefined) {
                res.status(400).json(ResponseFormatter_1.default.formatAsJSON(ResponseTypes_1.ResponseTypes.ERROR, "Food item doesn't exist in inventory."));
                return;
            }
            res.status(200).json(ResponseFormatter_1.default.formatAsJSON(ResponseTypes_1.ResponseTypes.SUCCESS, foodItem));
        };
        /**
         * Lets client to update information of the food item from user's inventory where user is at specified userID.
         * Upon successful operation, this handler will return all food items in user's inventory.
        *
        * @param req Request parameter that holds information about request
        * @param res Response parameter that holds information about response
        */
        this.updateFood = async (req, res) => {
            let userID = req.params.userID;
            let foodID = Number.parseInt(req.params.foodID);
            if (req.body.nutrients == undefined) {
                res.status(404).json(ResponseFormatter_1.default.formatAsJSON(ResponseTypes_1.ResponseTypes.ERROR, "Nutrition is not part of the payload."));
                return;
            }
            let parsedNutrients = JSON.parse(req.body.nutrients);
            let nutrients = [];
            parsedNutrients.forEach((nutrient) => {
                nutrients.push(new NutrientSchema_1.default(nutrient?.name, new UnitSchema_1.default(nutrient?.unit?.unit, nutrient?.unit?.value), nutrient?.percentOfDaily));
            });
            const newFood = new FoodItemSchema_1.default(foodID, req.body.name, req.body.category, nutrients, Number.parseFloat(req.body.expirationDate));
            const validator = new Validator_1.Validator();
            let logs = (await validator.validateObjectId(userID))
                .concat(await validator.validate(newFood));
            if (logs.length > 0) {
                res.status(400).json(ResponseFormatter_1.default.formatAsJSON(ResponseTypes_1.ResponseTypes.ERROR, logs));
                return;
            }
            let parameters = new Map([
                ["_id", userID]
            ]);
            let user = await this.database.GetUser(parameters);
            if (user === null) {
                res.status(404).json(ResponseFormatter_1.default.formatAsJSON(ResponseTypes_1.ResponseTypes.ERROR, "User hasn't been found."));
                return;
            }
            let inventory = user.inventory;
            let isFound = false;
            let newInventory = [];
            for (let i = 0; i < inventory.length; i++) {
                let foodToAdd = inventory[i];
                if (inventory[i].id === foodID) {
                    isFound = true;
                    foodToAdd = newFood;
                }
                newInventory.push(foodToAdd);
            }
            if (!isFound) {
                res.status(404).json(ResponseFormatter_1.default.formatAsJSON(ResponseTypes_1.ResponseTypes.ERROR));
                return;
            }
            user.inventory = newInventory;
            let updatedUser = await this.database.UpdateUser(userID, user);
            if (updatedUser === null) {
                res.status(400).json(ResponseFormatter_1.default.formatAsJSON(ResponseTypes_1.ResponseTypes.ERROR, "Food item could not be updated. User update error."));
                return;
            }
            res.status(200).json(ResponseFormatter_1.default.formatAsJSON(ResponseTypes_1.ResponseTypes.SUCCESS, updatedUser.inventory));
        };
        /**
        * Lets client to delete food item from user's inventory where user is at specified userID.
        * Upon successful operation, this handler will return all food items in user's inventory.
        *
        * @param req Request parameter that holds information about request
        * @param res Response parameter that holds information about response
        */
        this.deleteFood = async (req, res) => {
            let userID = req.params.userID;
            let foodID = Number.parseInt(req.params.foodID);
            const validator = new Validator_1.Validator();
            let logs = await validator.validateObjectId(userID);
            if (logs.length > 0) {
                res.status(400).json(ResponseFormatter_1.default.formatAsJSON(ResponseTypes_1.ResponseTypes.ERROR, logs));
                return;
            }
            let parameters = new Map([
                ["_id", userID]
            ]);
            let user = await this.database.GetUser(parameters);
            if (user === null) {
                res.status(404).json(ResponseFormatter_1.default.formatAsJSON(ResponseTypes_1.ResponseTypes.ERROR, logs));
                return;
            }
            let inventory = user.inventory;
            let isFound = false;
            let newInventory = [];
            for (let i = 0; i < inventory.length; i++) {
                if (inventory[i].id === foodID) {
                    isFound = true;
                }
                else {
                    newInventory.push(inventory[i]);
                }
            }
            if (!isFound) {
                res.status(404).json(ResponseFormatter_1.default.formatAsJSON(ResponseTypes_1.ResponseTypes.ERROR, "Food item doesn't exist in inventory"));
                return;
            }
            user.inventory = newInventory;
            let updatedUser = await this.database.UpdateUser(userID, user);
            if (updatedUser === null) {
                res.status(400).json(ResponseFormatter_1.default.formatAsJSON(ResponseTypes_1.ResponseTypes.ERROR, "Food item could not be updated. User update error."));
                return;
            }
            res.status(200).json(ResponseFormatter_1.default.formatAsJSON(ResponseTypes_1.ResponseTypes.SUCCESS, updatedUser.inventory));
        };
        this.database = database;
    }
}
exports.default = UserController;
//# sourceMappingURL=UserController.js.map