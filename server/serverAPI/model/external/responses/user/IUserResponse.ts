import IBaseUser from "../../../internal/user/IBaseUser";
import IContactInformation from "../../../internal/user/IContactInformation";
import IIdentification from "../../../internal/user/IIdentification";

export default interface IUserResponse extends IBaseUser, IIdentification, IContactInformation {}
