import IUser from "./IUser";
import IUserCredentials from "./IUserCredentials";

/**
 * User interface.
 */
export default interface IInternalUser extends IUserCredentials, IUser {}
