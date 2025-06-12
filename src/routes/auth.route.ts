import { Router } from 'express';
import { AuthController } from '@controllers/auth.controller';
import {
  ChangePasswordUserDto,
  CreateUserDto,
  GithubCallbackDto,
  LoginUserDto,
  TwoFALoginDto,
  NewPasswordUserDto,
  ResetPasswordUserDto,
  SignUpUserDto,
  UpdateProfileUserDto,
} from '@dtos/users.dto';
import { Routes } from '@interfaces/routes.interface';
import { AuthMiddleware } from '@middlewares/auth.middleware';
import { ValidationMiddleware } from '@middlewares/validation.middleware';

export class AuthRoute implements Routes {
  public path = '/';
  public router = Router();
  public auth = new AuthController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(`${this.path}signup`, ValidationMiddleware(SignUpUserDto), this.auth.signUp);
    this.router.post(`${this.path}signup-from-affiliate`, ValidationMiddleware(SignUpUserDto), this.auth.signUpFromAffiliate);
    this.router.post(`${this.path}login`, ValidationMiddleware(LoginUserDto), this.auth.logIn);
    this.router.post(`${this.path}twofalogin`, ValidationMiddleware(TwoFALoginDto), this.auth.towFAlogIn);
    this.router.post(`${this.path}auth/github/callback`, ValidationMiddleware(GithubCallbackDto), this.auth.authGithubCallback);
    this.router.get(`${this.path}me`, AuthMiddleware, this.auth.me);
    this.router.post(`${this.path}google-authenticate`, this.auth.googleAuthenticate);
    this.router.post(`${this.path}microsoft-authenticate`, this.auth.microsoftAuthenticate);
    this.router.post(`${this.path}generate`, AuthMiddleware, this.auth.generate);
    this.router.post(`${this.path}verify-otp`, AuthMiddleware, this.auth.verifyOtp);
    this.router.post(`${this.path}disable-otp`, AuthMiddleware, this.auth.disable2fa);
    this.router.post(`${this.path}reset-password`, ValidationMiddleware(ResetPasswordUserDto), this.auth.resetPassword);
    this.router.post(`${this.path}change-password`, AuthMiddleware, ValidationMiddleware(ChangePasswordUserDto), this.auth.changePassword);
    this.router.post(`${this.path}update-profile`, AuthMiddleware, ValidationMiddleware(UpdateProfileUserDto), this.auth.updateProfile);
    this.router.post(`${this.path}new-password`, ValidationMiddleware(NewPasswordUserDto), this.auth.newPassword);
    this.router.post(`${this.path}logout`, AuthMiddleware, this.auth.logOut);
    this.router.post(`${this.path}blockpass-hook`, this.auth.blockpassHook);
  }
}
