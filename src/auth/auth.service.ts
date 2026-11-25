import { Injectable, UnauthorizedException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity.js';
import { LoginDto } from './dto/login.dto.js';
import { UserStatus } from '../enums/user-status.enum.js';
import { UserRole } from '../enums/user-role.enum.js';
import { successResponseWithData ,successResponse,failureResponse,failureResponseWithError } from '../common/utils/response.helper.js';
import { SendOtpDto, VerifyOtpDto } from './dto/auth-otp.dto.js';

const ALLOWED_OTP_ROLES = new Set<UserRole>([
  UserRole.SUPERVISOR,
  UserRole.LABOURER,
]);

const DEFAULT_OTP = '123456';
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email })
      .getOne();

    if (!user || !user.password) {
      return failureResponse('Invalid user credentials')
    }

  if (user.status !== UserStatus.ACTIVE) {
      return failureResponse('Your account is inactive or suspended')
    }

   const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return failureResponse('Incorrect Password')
    }
   const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
    };

    const accessToken = this.jwtService.sign(payload);

    const { password: _, ...userData } = user;
    const loggedUser = { accessToken, user: userData }
    return successResponseWithData('Login Successfully', loggedUser);
  }
  async logout(userId: number) {
    return successResponse('Logged out successfully');
  }
  //consumer login APIs
  private userMobileFilter(mobileNo: string): string {
    return mobileNo.trim();
  }

  private async checkUser(mobileNo: string): Promise<any> {
    const normalizedMobile = this.userMobileFilter(mobileNo);

    const user = await this.userRepository.findOne({
      where: { mobileNo: normalizedMobile },
      relations: { site: true },
    });

    if (!user) {
      return failureResponse('No user found with this mobile number');
    }

    if (!ALLOWED_OTP_ROLES.has(user.role)) {
      return failureResponse(
        'OTP login is only available for Supervisor and Labour accounts',
      );
    }

    if (user.status !== UserStatus.ACTIVE) {
      return failureResponse('User account is inactive or blocked');
    }
    return user;
  }

  async sendOtp(dto: SendOtpDto) {
    const user = await this.checkUser(dto.mobileNo);

    // TODO: Replace with real SMS provider integration (e.g., Twilio, MSG91, SNS)
    // const userData = {
    //   mobileNo: user.mobileNo,
    //   role: user.role,
    //   expiresInSeconds: 300,
    // };
    return successResponse('OTP sent successfully');
  }

  async verifyOtp(dto: VerifyOtpDto) {
    const user = await this.checkUser(dto.mobileNo);

    if (dto.otp.trim() !== DEFAULT_OTP) {
      return failureResponse('Invalid OTP');
    }

    const payload = {
      sub: user.id,
      mobileNo: user.mobileNo,
      role: user.role,
      userSiteId: user.user_site_id ?? null,
    };

    const accessToken = await this.jwtService.signAsync(payload);
    const userData = {
      accessToken: `Bearer ${accessToken}`,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        displayName: user.displayName,
        mobileNo: user.mobileNo,
        email: user.email ?? null,
        role: user.role,
        status: user.status,
        user_site_id: user.user_site_id,
        site: user.site ?? null,
      }
    }
    return successResponseWithData('Verified otp successfully', userData);
  }
}