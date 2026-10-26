import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'YOUR_SUPER_SECRET_KEY', // Use ConfigService in production
    });
  }

  async validate(payload: any) {
    // This payload will be injected into req.user
    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
      status: payload.status,
    };
  }
}