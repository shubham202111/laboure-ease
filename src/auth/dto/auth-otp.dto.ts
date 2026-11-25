import { IsNotEmpty, IsString, Matches, Length } from 'class-validator';

export class SendOtpDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+?[0-9]{10,15}$/, {
    message: 'mobileNo must be a valid phone number (10-15 digits)',
  })
  mobileNo: string;
}

export class VerifyOtpDto extends SendOtpDto {
  @IsString()
  @IsNotEmpty()
  @Length(4, 8)
  otp: string;
}