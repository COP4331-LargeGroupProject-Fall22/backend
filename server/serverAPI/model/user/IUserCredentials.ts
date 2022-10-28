import IUserIdentification from "./IUserIdentification";

export default interface IUserCredentials extends IUserIdentification {
    password: string
}
