import ISensitiveUser from "./ISensitiveUser";

/**
 * User interface.
 */
export default interface IInternalUser extends ISensitiveUser {
    /**
     * Unique user identifier.
     */
    uid: string;
}
