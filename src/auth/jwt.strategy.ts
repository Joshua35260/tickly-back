//src/auth/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from '../../src/user/user.service';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

// token version
// @Injectable()
// export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
//   constructor(
//     private usersService: UserService,
//     private readonly configService: ConfigService,
//   ) {
//     super({
//       jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
//       ignoreExpiration: false,
//       secretOrKey: configService.get<string>('JWT_SECRET'),
//     });
//   }

//   async validate(payload: { userId: number }) {
//     const user = await this.usersService.findOne(payload.userId);

//     if (!user) {
//       throw new UnauthorizedException();
//     }

//     return user;
//   }

//cookie version
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        JwtStrategy.extractJWTFromCookie,
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  private static extractJWTFromCookie(req: Request): string | null {
    if (req.cookies && req.cookies['Tickly']) {
      return req.cookies['Tickly'];
    }
    return null;
  }

  async validate(payload: any) {
    // Utilisez l'ID de l'utilisateur pour rechercher l'utilisateur complet
    const user = await this.userService.findOne(payload.userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user; // Renvoyer l'utilisateur complet
  }
}
