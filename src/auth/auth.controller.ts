import { Controller, Post, Body, HttpCode, HttpStatus, Get, UseGuards, Req, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { LoginDto } from '../auth/dto/login.dto.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { RolesGuard } from './guards/roles.guard.js';
import { Roles } from './decorators/roles.decorator.js';
import { UserRole } from '../enums/user-role.enum.js';
import { successResponseWithData } from '../common/utils/response.helper.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
      const result = await this.authService.login(loginDto);
      return successResponseWithData(result, 'Login Successfully', 200);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPERVISOR)
  getProfile(@Req() req:any) {
    return {
      message: 'Access granted to protected route',
      user: req.user, 
    };
  }
}