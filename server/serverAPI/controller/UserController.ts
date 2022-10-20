import { Validator } from "../../utils/Validator";
import { Request, Response } from "express";
import { IUserDatabase } from '../../database/IUserDatabase';
import { UserSchema } from '../model/user/UserSchema';
import FoodItemSchema from "../model/food/FoodItemSchema";
import INutrient from "../model/nutrients/INutrient";
import { exit } from "process";
import NutrientSchema from "../model/nutrients/NutrientSchema";
import UnitSchema from "../model/unit/UnitSchema";
import IFoodItem from "../model/food/IFoodItem";

/**
 * This class creates several properties responsible for user-actions 
 * provided to the user.
 */
export class UserController {
    private database: IUserDatabase;

    constructor(database: IUserDatabase) {
        this.database = database;
    }

    /**
     * This property is a handler that is used for "getUsers" action of the user.
     * It provides user with an ability to receive summary of non-sensitive information about all existing users in the database.
     * 
     * @param req Request parameter that holds information about request
     * @param res Response parameter that holds information about response
     */
    getUsers = async (req: Request, res: Response) => {
        this.database.GetUsers()
            .then(users => res.status(200).json({ success: true, data: users }));
    }

    /**
     * This property is a handler that is used for "getUser" action of the user.
     * It provides user with an ability to receive their own information (complete information) from the database.
     * 
     * @param req Request parameter that holds information about request
     * @param res Response parameter that holds information about response
     */
    getUser = async (req: Request, res: Response) => {
        let userID = req.params.userID;

        const validator = new Validator();

        let logs = await validator.validateObjectId(userID)

        if (logs.length > 0) {
            res.status(400).json({ success: false, data: logs });
        } else {

            let parameters = new Map<String, any>([
                ["_id", userID]
            ]);

            let userFound = await this.database.GetUser(parameters);

            if (userFound === null) {
                res.status(404).json({ success: false, data: null });
            } else {
                res.status(200).json({ success: true, data: userFound });
            }
        }
    }

    /**
     * This property is a handler that is used for "updateUser" action of the user.
     * It provides user with an ability to update their own information on the database.
     * 
     * @param req Request parameter that holds information about request
     * @param res Response parameter that holds information about response
     */
    updateUser = async (req: Request, res: Response) => {
        let userID = req.params.userID;

        const newUser =
            new UserSchema(
                req.body.firstName,
                req.body.lastName,
                req.body.uid
            );

        const validator = new Validator<UserSchema>();

        let logs = (await validator.validate(newUser))
            .concat(await validator.validateObjectId(userID));

        if (logs.length > 0) {
            res.status(400).json({ success: false, data: logs });
        } else {
            let existingUser = await this.database.GetUser(new Map([["_id", userID]]));

            if (existingUser === null) {
                res.status(404).json({ success: false, data: null });
            } else {
                newUser.inventory = existingUser.inventory;

                let updatedUser = await this.database.UpdateUser(userID, newUser);

                res.status(200).json({ success: true, data: updatedUser });
            }
        }
    }

    /**
     * This property is a handler that is used for "deleteUser" action of the user.
     * It provides user with an ability to delete their own information from the database.
     * 
     * @param req Request parameter that holds information about request
     * @param res Response parameter that holds information about response
     */
    deleteUser = async (req: Request, res: Response) => {
        let userID = req.params.userID;

        const validator = new Validator<UserSchema>();

        let logs = await validator.validateObjectId(userID);

        if (logs.length > 0) {
            res.status(400).json({ success: false, data: logs });
        } else {
            let result = await this.database.DeleteUser(userID);

            if (result) {
                res.status(200).json({ success: true, data: null });
            } else {
                res.status(404).json({ success: false, data: null });
            }
        }
    }

    /**
     * This property is a handler that is used for "getFoods" action of the user.
     * It provides user with an ability to retrieve information about their food inventory.
     * 
     * @param req Request parameter that holds information about request
     * @param res Response parameter that holds information about response
     */
    getFoods = async (req: Request, res: Response) => {
        let userID = req.params.userID;

        const validator = new Validator();

        let logs = await validator.validateObjectId(userID)

        if (logs.length > 0) {
            res.status(400).json({ success: false, data: logs });
        } else {
            let parameters = new Map<String, any>([
                ["_id", userID]
            ]);

            let userFound = await this.database.GetUser(parameters);

            if (userFound === null) {
                res.status(404).json({ success: false, data: null });
            } else {
                res.status(200).json({ success: true, data: userFound.inventory });
            }
        }
    }

    /**
    * This property is a handler that is used for "addFood" action of the user.
    * It provides user with an ability to add food to the inventory.
    * 
    * @param req Request parameter that holds information about request
    * @param res Response parameter that holds information about response
    */
    addFood = async (req: Request, res: Response) => {
        let userID = req.params.userID;

        let parsedNutrients = JSON.parse(req.body.nutrients);

        let nutrients: NutrientSchema[] = [];

        parsedNutrients.forEach((nutrient: any) => {
            nutrients.push(new NutrientSchema(
                nutrient?.name,
                new UnitSchema(
                    nutrient?.unit?.unit,
                    nutrient?.unit?.value
                ),
                nutrient?.percentOfDaily
            ));
        });

        const newFood =
            new FoodItemSchema(
                Number.parseInt(req.body.id),
                req.body.name,
                req.body.category,
                nutrients,
                Number.parseFloat(req.body.expirationDate)
            );


        const validator = new Validator();

        let logs = (await validator.validateObjectId(userID))
            .concat(await validator.validate(newFood))

        if (logs.length > 0) {
            res.status(400).json({ success: false, data: logs });
        } else {
            let existingUser = await this.database.GetUser(new Map([["_id", userID]]));

            if (existingUser === null) {
                res.status(404).json({ success: false, data: null });
            } else {
                let existingFood = existingUser.inventory.find(foodItem => foodItem.id === newFood.id);
                if (existingFood !== undefined) {
                    res.status(400).json({ success: false, data: "Food item already exists in inventory" });
                }

                existingUser.inventory.push(newFood);

                let updatedUser = await this.database.UpdateUser(userID, existingUser);

                res.status(200).json({ success: true, data: updatedUser?.inventory });
            }
        }
    }

    /**
    * This property is a handler that is used for "getFood" action of the user.
    * It provides user with an ability to retrieve information about specific food in their inventory.
    * 
    * @param req Request parameter that holds information about request
    * @param res Response parameter that holds information about response
    */
    getFood = async (req: Request, res: Response) => {
        let userID = req.params.userID;
        let foodID = req.params.foodID

        const validator = new Validator();

        let logs = await validator.validateObjectId(userID)

        if (logs.length > 0) {
            res.status(400).json({ success: false, data: logs });
        } else {
            let parameters = new Map<String, any>([
                ["_id", userID]
            ]);

            let userFound = await this.database.GetUser(parameters);

            if (userFound === null) {
                res.status(404).json({ success: false, data: null });
            } else {
                let foodItem = userFound.inventory.find(foodItem => foodItem.id === Number.parseInt(foodID));

                if (foodItem === undefined) {
                    res.status(400).json({ success: false, data: "Food item doesn't exist in inventory" });
                }

                res.status(200).json({ success: true, data: foodItem });
            }
        }
    }

    /**
    * This property is a handler that is used for "updateFood" action of the user.
    * It provides user with an ability to update food in the user's inventory.
    * 
    * @param req Request parameter that holds information about request
    * @param res Response parameter that holds information about response
    */
    updateFood = async (req: Request, res: Response) => {
        let userID = req.params.userID;
        let foodID = Number.parseInt(req.params.foodID);

        let parsedNutrients = JSON.parse(req.body.nutrients);

        let nutrients: NutrientSchema[] = [];

        parsedNutrients.forEach((nutrient: any) => {
            nutrients.push(new NutrientSchema(
                nutrient?.name,
                new UnitSchema(
                    nutrient?.unit?.unit,
                    nutrient?.unit?.value
                ),
                nutrient?.percentOfDaily
            ));
        });

        const newFood =
            new FoodItemSchema(
                foodID,
                req.body.name,
                req.body.category,
                nutrients,
                Number.parseFloat(req.body.expirationDate)
            );

        const validator = new Validator();

        let logs = (await validator.validateObjectId(userID))
            .concat(await validator.validate(newFood))

        if (logs.length > 0) {
            res.status(400).json({ success: false, data: logs });
        } else {
            let existingUser = await this.database.GetUser(new Map([["_id", userID]]));

            if (existingUser === null) {
                res.status(404).json({ success: false, data: null });
            } else {
                let inventory = existingUser.inventory;

                let isFound: boolean = false;

                let newInventory: IFoodItem[] = [];

                for (let i = 0; i < inventory.length; i++) {
                    let foodToAdd = inventory[i];

                    if (inventory[i].id === foodID) {
                        isFound = true;
                        foodToAdd = newFood;
                    }

                    newInventory.push(foodToAdd);
                }

                if (!isFound) {
                    res.status(404).json({ success: false, data: null });
                }
                else {
                    existingUser.inventory = newInventory;

                    let updatedUser = await this.database.UpdateUser(userID, existingUser);
                    res.status(200).json({ success: true, data: updatedUser?.inventory });
                }
            }
        }
    }

    /**
    * This property is a handler that is used for "deleteFood" action of the user.
    * It provides user with an ability to delete specific food from their inventory.
    * 
    * @param req Request parameter that holds information about request
    * @param res Response parameter that holds information about response
    */
     deleteFood = async (req: Request, res: Response) => {
        let userID = req.params.userID;
        let foodID = Number.parseInt(req.params.foodID);

        const validator = new Validator();

        let logs = await validator.validateObjectId(userID)

        if (logs.length > 0) {
            res.status(400).json({ success: false, data: logs });
        } else {
            let parameters = new Map<String, any>([
                ["_id", userID]
            ]);

            let existingUser = await this.database.GetUser(parameters);

            if (existingUser === null) {
                res.status(404).json({ success: false, data: null });
            } else {
                let inventory = existingUser.inventory;

                let isFound: boolean = false;

                let newInventory: IFoodItem[] = [];

                for (let i = 0; i < inventory.length; i++) {
                    if (inventory[i].id === foodID) {
                        isFound = true;
                    }
                    else {
                        newInventory.push(inventory[i]);
                    }
                }

                if (!isFound) {
                    res.status(400).json({ success: false, data: "Food item doesn't exist in inventory" });
                }

                existingUser.inventory = newInventory;

                let updatedUser = await this.database.UpdateUser(userID, existingUser);
            
                res.status(200).json({ success: true, data:  updatedUser?.inventory});
            }
        }
    }
}
