import { hash } from 'bcrypt';
import { Service } from 'typedi';
import { HttpException } from '@exceptions/httpException';
import { User } from '@interfaces/users.interface';
import { UserModel } from '@models/users.model';

@Service()
export class UserService {
  public async findAllUser(): Promise<User[]> {
    return UserModel.find();
  }

  public async findUserById(UserId: string): Promise<User> {
    const findUser: User = await UserModel.findOne({ _id: UserId });
    if (!findUser) throw new HttpException(409, "Super User doesn't exist");

    return findUser;
  }

  public async createUser(UserData: User): Promise<User> {
    const findUser: User = await UserModel.findOne({ email: UserData.email });
    if (findUser) throw new HttpException(409, `This email ${UserData.email} already exists`);

    const hashedPassword = await hash(UserData.password, 10);
    return UserModel.create({ ...UserData, password: hashedPassword });
  }

  public async updateUser(UserId: string, UserData: User): Promise<User> {
    if (UserData.email) {
      const findUser: User = await UserModel.findOne({ email: UserData.email });
      if (findUser && findUser._id != UserId) throw new HttpException(409, `This email ${UserData.email} already exists`);
    }

    if (UserData.password) {
      const hashedPassword = await hash(UserData.password, 10);
      UserData = { ...UserData, password: hashedPassword };
    }

    const updateUserById: User = await UserModel.findByIdAndUpdate(UserId, { UserData });
    if (!updateUserById) throw new HttpException(409, "Super User doesn't exist");

    return updateUserById;
  }

  public async deleteUser(UserId: string): Promise<User> {
    const deleteUserById: User = await UserModel.findByIdAndDelete(UserId);
    if (!deleteUserById) throw new HttpException(409, "Super User doesn't exist");

    return deleteUserById;
  }
}
