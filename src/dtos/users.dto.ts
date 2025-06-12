import { IsEmail, IsString, IsNotEmpty, MinLength, Matches, IsOptional, Length, isNotEmpty } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  public firstName: string;

  @IsString()
  @IsNotEmpty()
  public lastName: string;

  @IsEmail()
  @IsNotEmpty()
  public email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/, {
    message: 'Password must contain at least one lowercase letter, one uppercase letter, one numeric digit, and one special character',
  })
  public password: string;
}

export class ResetPasswordUserDto {
  @IsEmail()
  @IsNotEmpty()
  public email: string;
}

export class ChangePasswordUserDto {
  @IsString()
  @IsNotEmpty()
  public oldPassword: string;

  @IsString()
  @IsNotEmpty()
  public password: string;
}
export class UpdateProfileUserDto {
  @IsEmail()
  @IsNotEmpty()
  public email: string;

  @IsNotEmpty()
  public prev_email: string;

  @IsNotEmpty()
  public phoneNumber: string;

  @IsString()
  @IsOptional()
  public country: string;

  @IsString()
  @IsOptional()
  public firstName: string;

  @IsString()
  @IsOptional()
  public lastName: string;
}

export class NewPasswordUserDto {
  @IsEmail()
  @IsNotEmpty()
  public email: string;

  @IsString()
  @IsNotEmpty()
  public otpCode: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(4)
  // @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/, {
  //   message: 'Password must contain at least one lowercase letter, one uppercase letter, one numeric digit, and one special character',
  // })
  public newPassword: string;
}

export class LoginUserDto {
  @IsEmail()
  @IsNotEmpty()
  public email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(4)
  // @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/, {
  //   message: 'Password must contain at least one lowercase letter, one uppercase letter, one numeric digit, and one special character',
  // })
  public password: string;
}

export class TwoFALoginDto {
  @IsEmail()
  @IsNotEmpty()
  public email: string;

  @IsString()
  @IsNotEmpty()
  @Length(6)
  public otpToken: string;
}

export class GithubCallbackDto {
  @IsString()
  @IsNotEmpty()
  public code: string;
}

export class SignUpUserDto {
  @IsEmail()
  @IsNotEmpty()
  public email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(4)
  // @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/, {
  //   message: 'Password must contain at least one lowercase letter, one uppercase letter, one numeric digit, and one special character',
  // })
  public password: string;

  @IsString()
  @IsNotEmpty()
  public firstName: string;

  @IsString()
  @IsNotEmpty()
  public lastName: string;

  @IsString()
  @IsNotEmpty()
  public cardName: string;

  @IsString()
  @IsNotEmpty()
  public paymentMethodId: string;
}

export class UpdateUserDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/, {
    message: 'Password must contain at least one lowercase letter, one uppercase letter, one numeric digit, and one special character',
  })
  public password: string;
}
