import { NextFunction, Request, Response } from 'express';
import { Container } from 'typedi';
import { verify } from 'jsonwebtoken';
import speakeasy from 'speakeasy';
import qrcode from 'qrcode';
import { sign } from 'jsonwebtoken';
import { DataStoredInToken, RequestWithUser, TokenData, ILoginRequestParams, I2FALoginRequestParams } from '@interfaces/auth.interface';
import { User } from '@interfaces/users.interface';
import { BlockpassSingleCandidate, BlockpassHookRequest, KycInfo } from '@interfaces/kyc.interface';
import { AuthService } from '@services/auth.service';
import { EmailService } from '@services/email.service';
import { ChangePasswordUserDto, NewPasswordUserDto, ResetPasswordUserDto, UpdateProfileUserDto } from '@dtos/users.dto';
import { GOOGLE_CLIENT_ID, SECRET_KEY, BLOCKPASS_CLIENT_ID, BLOCKPASS_API_KEY, SUBSCRIPTION_PRIVATE_CLUB } from '@config';
import { UserModel } from '@models/users.model';
import { KycModel } from '@models/kyc.model';
import { KycHistoryModel } from '@models/kyc_history.model';
import { authenticator } from 'otplib';
import { compare, hash } from 'bcrypt';
import { HttpException } from '@/exceptions/httpException';
import { OAuth2Client } from 'google-auth-library';
import axios from 'axios';
import { StripeService } from '@/services/stripe.service';
import { config } from 'dotenv';
import { jwtDecode } from 'jwt-decode';
import { Octokit } from 'octokit';
import { priceForPassInvest } from '@/utils/common';
import { SubscriptionModel } from '@/models/subscription.model';
import { AffiliateMappingModel } from '@/models/affiliate_mapping';
import { ACTIVE_MONTHLY_PLAN_ID, ACTIVE_YEARLY_PLAN_ID } from '@/utils/constants';

const googleClient = new OAuth2Client({
  clientId: GOOGLE_CLIENT_ID,
});

const GITHUB_CLIENT_ID = 'eb348b7f57c65bbe8831';
const GITHUB_CLIENT_SECRET = 'f183b33d5ae43bafbdacb635d66c6cf7d5e98afc';

const createToken = (user: User, rememberMe = false): TokenData => {
  const dataStoredInToken: DataStoredInToken = { _id: user._id };
  const expiresIn: number = rememberMe ? 365 * 24 * 60 * 60 : 4 * 60 * 60;

  return { expiresIn, token: sign(dataStoredInToken, SECRET_KEY, { expiresIn }) };
};

export class AuthController {
  public auth = Container.get(AuthService);
  public stripe = Container.get(StripeService);
  public emailService = Container.get(EmailService);

  createUser = async userData => {
    const customer = await this.stripe.createStripeCustomer({
      email: userData.email,
      name: userData.cardName,
      paymentMethodId: userData.paymentMethodId,
    });

    const subscription = userData.subscription;

    let passInvestSubscription = null;
    let actInvestSubscription = null;
    if (subscription.passInvest) {
      const price = await this.stripe.createPrice({
        unit_amount: priceForPassInvest(subscription.investAmount).toFixed(0),
      });

      passInvestSubscription = await this.stripe.createSubscription({
        customer_id: customer.id,
        price_id: price.id,
      });
    }
    
    if (subscription.actInvest) {
      actInvestSubscription = await this.stripe.createSubscription({
        customer_id: customer.id,
        price_id: SUBSCRIPTION_PRIVATE_CLUB[subscription.privateClubFreq],
      });
    }

    const { accessToken, user } = await this.auth.signup(userData);
    user.stripeCustomerId = customer.id;
    await user.save();

    if (userData.code != '') {
      const existedAffiliateCode = await AffiliateMappingModel.findOne({ hashedUserId: userData.code });
      if (existedAffiliateCode) {
        const findAffiliateUser = await UserModel.findOne({ _id: existedAffiliateCode.userId });
        if (findAffiliateUser) {
          findAffiliateUser.affiliation.customers.push({
            userId: user._id,
          });

          await findAffiliateUser.save();
        }
      }
    }

    if (subscription.passInvest) {
      const newSubscription = new SubscriptionModel({
        userId: user._id,
        type: 'passive',
        subscriptionId: passInvestSubscription.id,
      });

      await newSubscription.save();
    }

    if (subscription.actInvest) {
      const newSubscription = new SubscriptionModel({
        userId: user._id,
        type: 'active',
        subscriptionId: actInvestSubscription.id,
      });

      await newSubscription.save();
    }

    this.emailService.sendSignupCompleted(userData.email, userData.firstName + ' ' + userData.lastName);

    return {
      accessToken,
      user,
    };
  };

  public signUp = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userData = req.body;

      const { accessToken, user } = await this.createUser(userData);

      res.status(201).json({ data: { accessToken, user }, message: 'signup' });
    } catch (error) {
      next(error);
    }
  };

  public signUpFromAffiliate = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userData = req.body;

      const { accessToken, user } = await this.createUser(userData);

      res.status(201).json({ data: { accessToken, user }, message: 'affiliation' });
    } catch (error) {
      next(error);
    }
  };

  public googleAuthenticate = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token } = req.body;

      const tokenRes = await axios.get(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${token}`);

      const tokenInfo = tokenRes.data;

      const findUser: User = await UserModel.findOne({ email: tokenInfo.email });

      if (!findUser) {
        return res.status(200).json({
          data: { email: tokenInfo.email, firstName: tokenInfo.given_name, lastName: tokenInfo.family_name },
          message: 'googleAuthenticate',
          status: false,
        });
      }
      const accessToken = createToken(findUser);
      return res.status(201).json({ data: { accessToken, user: findUser }, message: 'googleAuthenticate', status: true });
    } catch (error) {
      next(error);
    }
  };

  public microsoftAuthenticate = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token } = req.body;

      const data: any = jwtDecode(token);
      const findUser: User = await UserModel.findOne({ email: data.email });

      if (!findUser) {
        return res.status(200).json({
          data: { email: data.email, firstName: '', lastName: '' },
          message: 'microsoftAuthenticate',
          status: false,
        });
      }
      const accessToken = createToken(findUser);
      return res.status(201).json({ data: { accessToken, user: findUser }, message: 'microsoftAuthenticate', status: true });
    } catch (error) {
      next(error);
    }
  };

  public logIn = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userData: ILoginRequestParams = req.body;
      const { accessToken, user, tempToken } = await this.auth.login(userData);

      res.status(200).json({ data: { accessToken, user, tempToken }, message: 'login' });
    } catch (error) {
      next(error);
    }
  };

  public towFAlogIn = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userData: I2FALoginRequestParams = req.body;
      const { accessToken, user } = await this.auth.verify2FA(userData);

      res.status(200).json({ data: { accessToken, user }, message: 'login' });
    } catch (error) {
      next(error);
    }
  };

  public authGithubCallback = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const code = req.body.code;
      // Exchange code for access token
      const tokenResponse = await axios.post(
        'https://github.com/login/oauth/access_token',
        {
          client_id: GITHUB_CLIENT_ID,
          client_secret: GITHUB_CLIENT_SECRET,
          code,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        },
      );

      const tokenData = tokenResponse.data;
      const accessToken = tokenData.access_token;

      if (accessToken) {
        const octokit = new Octokit({
          auth: accessToken,
        });

        try {
          const emailsResponse = await octokit.request('GET /user/emails', {
            headers: {
              'X-GitHub-Api-Version': '2022-11-28',
            },
          });

          const emails = emailsResponse.data;
          const email = emails.find(item => item.primary == true).email;

          const findUser: User = await UserModel.findOne({ email: email });
          if (!findUser) {
            return res.status(200).json({
              data: { email: email, firstName: '', lastName: '' },
              message: 'githubAuthenticate',
              status: false,
            });
          }
          const accessToken = createToken(findUser);
          return res.status(200).json({ data: { accessToken, user: findUser }, message: 'githubAuthenticate', status: true });
        } catch (error) {
          next(error);
        }
      } else {
        throw new HttpException(409, 'AccessToken is missing');
      }
    } catch (error) {
      next(error);
    }
  };

  public me = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.headers.authorization.split(' ')[1];

      if (!token) {
        res.status(400).json({ message: 'Invalid Token' });
      }

      const decodedToken = verify(token, SECRET_KEY);

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const { _id } = decodedToken;

      const finduser = await UserModel.findOne({ _id });

      res.status(200).json({ data: { user: finduser }, message: 'me' });
    } catch (error) {
      next(error);
    }
  };

  public generate = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.headers.authorization.split(' ')[1];

      if (!token) {
        res.status(400).json({ message: 'Invalid Token' });
      }

      const decodedToken = verify(token, SECRET_KEY);

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const { _id } = decodedToken;

      const finduser = await UserModel.findOne({ _id });

      // const secret = speakeasy.generateSecret({ length: 16 });
      // const otpauth_url = secret.otpauth_url;

      // qrcode.toDataURL(otpauth_url, (err, data_url) => {
      //   res.status(200).json({ secret: secret.base32, qrcode: data_url });
      // });

      if (finduser.twofaEnabled) {
        return res.status(400).json({
          message: '2FA already verified and enabled',
          twofaEnabled: finduser.twofaEnabled,
        });
      }

      const appName = 'Scale-In';
      // const secret = authenticator.generateSecret();
      const secret = speakeasy.generateSecret({
        issuer: appName,
        name: finduser.email,
        length: 16,
      });

      finduser.twofaSecret = secret.base32;
      finduser.save();

      return res.json({
        message: '2FA secret generation successful',
        secret: secret.base32,
        qrcode: await qrcode.toDataURL(secret.otpauth_url),
        twofaEnabled: finduser.twofaEnabled,
      });
    } catch (error) {
      next(error);
    }
  };

  public disable2fa = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization.split(' ')[1];

    if (!token) {
      res.status(400).json({ message: 'Invalid Token' });
    }

    const decodedToken = verify(token, SECRET_KEY);

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const { _id } = decodedToken;

    const finduser = await UserModel.findOne({ _id });

    const otpToken = req.body.token.replaceAll(' ', '');

    const verified = speakeasy.totp.verify({
      secret: finduser.twofaSecret,
      encoding: 'base32',
      token: otpToken,
      window: 1, // Allow a time window of 1 unit (default is 0)
    });

    if (verified) {
      finduser.twofaEnabled = false;
      finduser.twofaSecret = '';
      await finduser.save();

      return res.json({
        message: '2FA disabled successfully',
        twofaEnabled: finduser.twofaEnabled,
        token: createToken(finduser),
        user: finduser,
      });
    } else {
      return res.status(400).json({
        message: 'OTP verification failed: Invalid token',
        twofaEnabled: finduser.twofaEnabled,
      });
    }
  };

  public verifyOtp = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.headers.authorization.split(' ')[1];

      if (!token) {
        res.status(400).json({ message: 'Invalid Token' });
      }

      const decodedToken = verify(token, SECRET_KEY);

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const { _id } = decodedToken;

      const finduser = await UserModel.findOne({ _id });

      if (finduser.twofaEnabled) {
        return res.json({
          message: '2FA already verified and enabled',
          twofaEnabled: finduser.twofaEnabled,
        });
      }

      const otpToken = req.body.token.replaceAll(' ', '');

      console.log('otpToken ', otpToken);
      console.log('secret ', finduser.twofaSecret);
      const verified = speakeasy.totp.verify({
        secret: finduser.twofaSecret,
        encoding: 'base32',
        token: otpToken,
        // window: 1, // Allow a time window of 1 unit (default is 0)
      });
      console.log('verified ', verified);

      if (!verified) {
        return res.status(400).json({
          message: 'OTP verification failed: Invalid token',
          twofaEnabled: finduser.twofaEnabled,
        });
      } else {
        finduser.twofaEnabled = true;
        finduser.save();

        return res.json({
          message: 'OTP verification successful',
          twofaEnabled: finduser.twofaEnabled,
          token: createToken(finduser),
          user: finduser,
        });
      }
    } catch (error) {
      next(error);
    }
  };

  public resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userData: ResetPasswordUserDto = req.body;
      await this.auth.resetPassword(userData);

      res.status(200).json({ message: 'sent otp verification code to your email.' });
    } catch (error) {
      next(error);
    }
  };

  public changePassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userData: ChangePasswordUserDto = req.body;

      const token = req.headers.authorization.split(' ')[1];

      if (!token) {
        res.status(400).json({ message: 'Invalid Token' });
      }

      const decodedToken = verify(token, SECRET_KEY);

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const { _id } = decodedToken;

      const findUser = await UserModel.findOne({ _id });

      const isPasswordMatching: boolean = await compare(userData.oldPassword, findUser.password);
      if (!isPasswordMatching) throw new HttpException(409, 'Password is not matching');

      const hashedPassword = await hash(userData.password, 10);
      findUser.password = hashedPassword;
      findUser.save();

      res.status(200).json({ message: 'Reset new password succeed' });
    } catch (error) {
      next(error);
    }
  };

  public updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userData: UpdateProfileUserDto = req.body;

      const token = req.headers.authorization.split(' ')[1];

      if (!token) {
        res.status(400).json({ message: 'Invalid Token' });
      }

      const decodedToken = verify(token, SECRET_KEY);

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const { _id } = decodedToken;
      const findUser = await UserModel.findOneAndUpdate(
        { email: userData.prev_email }, // Filter
        {
          $set: {
            email: userData.email,
            country: userData.country,
            ...(userData.firstName && { firstName: userData.firstName }),
            ...(userData.lastName && { lastName: userData.lastName }),
            ...(userData.phoneNumber && { phoneNumber: userData.phoneNumber })
          }
        }, // Update field
        { new: true, upsert: true } // Return updated document, create if not exists
      );
      
      if (!findUser) {
        throw new Error("User not found");
      }
      res.status(200).json({ message: 'Profile update succeed', token: createToken(findUser), user: findUser });
    } catch (error) {
      next(error);
    }
  };

  public newPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userData: NewPasswordUserDto = req.body;
      await this.auth.newPassword(userData);

      res.status(200).json({ message: 'Reset new password succeed' });
    } catch (error) {
      next(error);
    }
  };

  public logOut = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const userData: User = req.user;
      const logOutUserData: User = await this.auth.logout(userData);

      res.setHeader('Set-Cookie', ['Authorization=; Max-age=0']);
      res.status(200).json({ data: logOutUserData, message: 'logout' });
    } catch (error) {
      next(error);
    }
  };

  public blockpassHook = async (req: Request, res: Response, next: NextFunction) => {
    const event: BlockpassHookRequest = req.body;

    try {
      const newRequest = new KycHistoryModel({
        issuer: 'blockpass',
        request: JSON.stringify(event),
        createdAt: (new Date()).toISOString(),
      });

      await newRequest.save();

      const findUser = await UserModel.findOne({ _id: event.refId });

      if (!findUser) {
        return res.status(404).json({ message: 'refId is invalid' });
      }

      if (!findUser.kyc) {
        findUser.kyc = {
          status: '',
          verified: false,
        }
      }

      if (event.event === 'user.created') {
        findUser.kyc.status = event.status;
      } else if (event.event === 'user.readyToReview') {
        findUser.kyc.status = event.status;
      } else if (event.event === 'user.inReview') {
        findUser.kyc.status = event.status;
      } else if (event.event === 'review.rejected') {
        findUser.kyc.status = event.status;
      } else if (event.event === 'user.blocked') {
        findUser.kyc.status = event.status;
      } else if (event.event === 'user.deleted') {
        findUser.kyc.status = event.status;
      } else if (event.event === 'review.approved') {
        findUser.kyc.status = event.status;
        const singleInfo = await axios.get<BlockpassSingleCandidate>(`https://kyc.blockpass.org/kyc/1.0/connect/${BLOCKPASS_CLIENT_ID}/refId/${event.refId}`,{
          headers: {
            'Authorization': BLOCKPASS_API_KEY,
          }
        });

        const newKycModel = new KycModel({
          userId: event.refId,
          recordId: event.recordId,
          blockPassID: singleInfo.data.data.blockPassID,
          isArchived: singleInfo.data.data.isArchived,
          inreviewDate: singleInfo.data.data.inreviewDate,
          waitingDate: singleInfo.data.data.waitingDate,
          approvedDate: singleInfo.data.data.approvedDate,
          identities: {
            address: singleInfo.data.data.identities.address?.value || '',
            dob: singleInfo.data.data.identities.dob.value,
            email: singleInfo.data.data.identities.email.value,
            family_name: singleInfo.data.data.identities.family_name.value,
            given_name: singleInfo.data.data.identities.given_name.value,
            phone: singleInfo.data.data.identities.phone?.value || '',
            selfie_national_id: singleInfo.data.data.identities.selfie_national_id?.value || '',
            proof_of_address: singleInfo.data.data.identities.proof_of_address?.value || '',
            selfie: singleInfo.data.data.identities.selfie?.value || '',
            passport: singleInfo.data.data.identities.passport?.value || '',
            national_id_issuing_country: singleInfo.data.data.identities.national_id_issuing_country?.value || '',
          },
          certs:{
            cert1: singleInfo.data.data.certs.cert1,
            cert2: singleInfo.data.data.certs.cert2,
          }
        });
        await newKycModel.save();
      }
      await findUser.save();

      res.status(200).json({ message: 'Thank you for submit.' });
    } catch (error) {
      console.log(error);
      next(error);
    }
  };
}
