import IFood from "../serverAPI/model/food/IFood";

export default interface IFoodAPI {
    GetFoods(parameters: Map<string, any>): Promise<Partial<IFood>[]>;
    GetFood(parameters: Map<string, any>): Promise<IFood | null>;
}
