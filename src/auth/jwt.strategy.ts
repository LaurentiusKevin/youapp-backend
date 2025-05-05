import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { jwtConstants } from './constants';
import { AuthService } from './auth.service';
import { JwtDto } from './dto/jwt.dto';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromHeader('x-access-token'),
      secretOrKey: jwtConstants.secret,
    });
  }

  async validate(payload: JwtDto) {
    try {
      return this.authService.validateJwtUser(payload.username, payload.email);
    } catch (error) {
      const err = error as Error;
      console.error('JwtStrategy validation error:', err);

      return null;
    }
  }
}
