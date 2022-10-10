import { IUser } from "../api/model/user/IUser";

export interface IDatabase {
    GetUsers(parameters: Map<String, String>|null): Promise<IUser[] | null>;

    GetUser(parameters: Map<String, String>|null): Promise<IUser | null>;
    
    CreateUser(user: IUser): Promise<IUser | null>;
    
    UpdateUser(id: string, user:IUser): Promise<IUser | null>;
    
    DeleteUser(id: string): Promise<boolean>;
}
