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
     * Last time user has been seen online in number format where number starts from 1970.
     */
    lastSeen: number;
}
