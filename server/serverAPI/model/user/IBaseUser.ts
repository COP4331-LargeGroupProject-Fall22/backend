export default interface IBaseUser {
    /**
     * User's first name.
     */
    firstName: string;

    /**
     * User's last name.
     */
    lastName: string;

    /**
     * Last time user has been seen in seconds since Unix epoch.
     */
    lastSeen: number;
}
