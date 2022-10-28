import IUser from "./IUser";
import IUserIdentification from "./IUserIdentification";

export default interface IExternalUser extends IUserIdentification, IUser {}
