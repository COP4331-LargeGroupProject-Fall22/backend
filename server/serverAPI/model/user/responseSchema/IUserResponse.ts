import IBaseUser from "../IBaseUser";
import IContactInformation from "../IContactInformation";
import IIdentification from "../IIdentification";

export default interface IUserResponse extends IBaseUser, IIdentification, IContactInformation {}
