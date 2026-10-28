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
}