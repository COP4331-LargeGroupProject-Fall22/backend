import IFood from "../serverAPI/model/food/IFood";

export default interface IFoodAPI {
    SearchFoods(parameters: Map<string, any>): Promise<Partial<IFood>[]>;
    GetFood(parameters: Map<string, any>): Promise<IFood | null>;
    GetFoodByUPC(parameters: Map<string, any>): Promise<IFood | null>;
}
