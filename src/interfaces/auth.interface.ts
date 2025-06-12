import { Request } from 'express';
import { User } from '@interfaces/users.interface';

export interface DataStoredInToken {
  _id: string;
}

export interface TokenData {
  token: string;
  expiresIn: number;
}

export interface RequestWithUser extends Request {
  user: User;
}

export interface ILoginRequestParams {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface I2FALoginRequestParams extends ILoginRequestParams {
  otpToken: string;
  tempToken: string;
}