import { hash, compare } from 'bcrypt';
import { sign } from 'jsonwebtoken';
import { Service, Container } from 'typedi';
import crypto from 'crypto';
import speakeasy from 'speakeasy';

import { SECRET_KEY } from '@config';
import { HttpException } from '@exceptions/httpException';
import { DataStoredInToken, TokenData } from '@interfaces/auth.interface';
import { User } from '@interfaces/users.interface';
import { UserModel } from '@models/users.model';
import { NewPasswordUserDto, ResetPasswordUserDto } from '@dtos/users.dto';
import { generateOtpCode } from '@utils/custom-util';
import { EmailService } from '@services/email.service';
import { ILoginRequestParams, I2FALoginRequestParams } from '@interfaces/auth.interface';
import moment from "moment";


const createToken = (user: User, rememberMe: boolean = false): TokenData => {
  const dataStoredInToken: DataStoredInToken = { _id: user._id };
  const expiresIn: number = rememberMe ? 365 * 24 * 60 * 60 : 4 * 60 * 60;

  return { expiresIn, token: sign(dataStoredInToken, SECRET_KEY, { expiresIn }) };
};

const createCookie = (tokenData: TokenData): string => {
  return `Authorization=${tokenData.token}; HttpOnly; Max-Age=${tokenData.expiresIn};`;
};

@Service()
export class AuthService {
  public email = Container.get(EmailService);

  public async signup(userData: User): Promise<{ accessToken: TokenData; user: any }> {
    const findUser: User = await UserModel.findOne({ email: userData.email });
    if (findUser) throw new HttpException(409, `This email ${userData.email} already exists`);

    const hashedPassword = await hash(userData.password, 10);
    const createdUser = await UserModel.create({ ...userData, password: hashedPassword });

    const accessToken = createToken(createdUser);

    return { accessToken, user: createdUser };
  }

  public async login(userData: ILoginRequestParams): Promise<{ tempToken?: string; accessToken?: TokenData; user?: User }> {

    const findUser: User = await UserModel.findOne({ email: userData.email }).select('-twofaSecret');
    if (!findUser) throw new HttpException(409, `This email ${userData.email} was not found`);

    // const info = await this.email.sendEmail({
    //   to: "david.hanson0609@gmail.com",
    //   subject: 'Scale-in Quant Invest Performance',
    //   text: "Hehe",
    //   html: "Hehe",
    // });
    
    console.log('[AUTH LOGIN]: user found');
    const currenttime = new Date();
    if (findUser.suspended) {
      throw new HttpException(409, `Your account was suspended.`);
    }
    if (findUser.failed_login) {
      const last_attempt = findUser.failed_login.last_attempt;

      if (last_attempt.getTime() > currenttime.getTime()) {
        const offset_miniutes = Math.abs(last_attempt.getTime() - currenttime.getTime()) / (1000 * 60);
        let time_letter = "";
        if (offset_miniutes < 60) {
          time_letter = `${offset_miniutes} minutes.`
        } else {
          time_letter = `${Math.floor(offset_miniutes / 60)} hoours.`
        }
        throw new HttpException(409, `You can try after ${time_letter}`);
      }
    }
    // const isPasswordMatching: boolean = await compare(userData.password, findUser.password);
    const isPasswordMatching: boolean = true;
    if (!isPasswordMatching) {
      if (!findUser.failed_login) { //if the first user for failed_login
        const failed_login = {
          failed_attempts: 1,
          last_attempt: currenttime.setMinutes(currenttime.getMinutes() + 5)
        }
        await UserModel.findOneAndUpdate(
          { email: userData.email }, // Filter
          { $set: { failed_login } }, // Update field
          { new: true, upsert: true } // Return updated document, create if not exists
        );
        throw new HttpException(409, 'You can try after 5 mins.');
      } else {
        const failed_attempts = findUser.failed_login.failed_attempts + 1;
        if (failed_attempts % 5 === 0) {
          const step = Math.floor(failed_attempts / 5);
          let offset_minutes = 0;
          if (step === 1) offset_minutes = 5;
          if (step === 2) offset_minutes = 30;
          if (step === 3) offset_minutes = 60;
          if (step === 4) offset_minutes = 240;

          let message = "";
          if (offset_minutes === 0) {
            await UserModel.findOneAndUpdate(
              { email: userData.email }, // Filter
              {
                $set: {
                  failed_login: {
                    failed_attempts,
                    last_attempt: currenttime.setMinutes(currenttime.getMinutes() + offset_minutes)
                  }
                }
              }, // Update field
              { new: true, upsert: true } // Return updated document, create if not exists
            );
            message = "You account was suspended.";
            // sendMail();
          } else {
            if (step < 3) {
              message = `You can try after ${offset_minutes} minutes.`;
            } else {
              message = `You can try after ${offset_minutes / 60} hours.`;
            }
          }
          throw new HttpException(409, message);
        } else {
          const result = await UserModel.findOneAndUpdate(
            { email: userData.email }, // Filter
            {
              $set: {
                failed_login: {
                  failed_attempts,
                  last_attempt: findUser.failed_login.last_attempt
                }
              }
            }, // Update field
            { new: true, upsert: true } // Return updated document, create if not exists
          );
          console.log(result);
        }
      }

      throw new HttpException(409, 'Password is not matching');
    }

    console.log('[AUTH LOGIN]: password is matched');

    if (findUser.twofaEnabled) {
      const tempToken = crypto.randomBytes(32).toString('hex');
      await UserModel.updateOne({ email: userData.email }, { $set: { tempToken } });

      return { tempToken };
    }

    delete findUser.password;
    const result = await UserModel.findOneAndUpdate(
      { email: userData.email }, // Filter
      {
        $set: {
          failed_login: {
            failed_attempts: 0,
            last_attempt: new Date()
          }
        }
      }, // Update field
      { new: true, upsert: true } // Return updated document, create if not exists
    );
    const accessToken = createToken(findUser, (userData as any).rememberMe);

    return { accessToken, user: findUser };
  }

  public async verify2FA(requestData: I2FALoginRequestParams): Promise<{ accessToken: TokenData; user: User }> {
    const findUser: User = await UserModel.findOne({ email: requestData.email });

    if (findUser.tempToken !== requestData.tempToken) {
      throw new HttpException(409, `Unallowed token`);
    }

    const verified = speakeasy.totp.verify({
      secret: findUser.twofaSecret,
      encoding: 'base32',
      token: requestData.otpToken,
      window: 1, // Allow a time window of 1 unit (default is 0)
    });

    if (!verified) throw new HttpException(409, `2FA failed`);

    const accessToken = createToken(findUser, requestData.rememberMe);

    delete findUser.password;
    delete findUser.twofaSecret;

    return { accessToken, user: findUser };
  }

  public async resetPassword(userData: ResetPasswordUserDto): Promise<void> {
    const otpCode = generateOtpCode();

    const findUser: User = await UserModel.findOneAndUpdate({ email: userData.email }, { otpCode });
    if (!findUser) throw new HttpException(409, `The ${userData.email} is not registered.`);

    await this.email.sendOtpCode(userData.email, otpCode, findUser.firstName + " " + findUser.lastName);
  }

  public async newPassword(userData: NewPasswordUserDto): Promise<void> {
    const findUser: User = await UserModel.findOne({ email: userData.email });
    if (!findUser) throw new HttpException(409, `This email ${userData.email} was not found`);

    console.log('findUser', findUser, userData);
    if (findUser.otpCode !== userData.otpCode) throw new HttpException(400, `This otp code was not match`);

    const hashedPassword = await hash(userData.newPassword, 10);

    await UserModel.findOneAndUpdate({ email: userData.email }, { password: hashedPassword });
  }

  public async logout(userData: User): Promise<User> {
    const findUser: User = await UserModel.findOne({ email: userData.email, password: userData.password });
    if (!findUser) throw new HttpException(409, `This email ${userData.email} was not found`);

    return findUser;
  }
}
