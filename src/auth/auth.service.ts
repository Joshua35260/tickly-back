import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';
import { AuthEntity } from './auth.entity';

export interface AuthenticatedRequest extends Request {
  user?: User; // Change `User` par le type approprié de ton utilisateur
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(login: string, password: string): Promise<AuthEntity> {
    const user = await this.prisma.user.findUnique({ where: { login: login } });

    if (!user) {
      throw new NotFoundException(`No user found for email: ${login}`);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }
    delete user.password;

    const accessToken = this.generateAccessToken(user.id);
    return {
      token: accessToken,
      expire: this.jwtService.decode(accessToken).exp,
      user: user,
    };
  }

  private generateAccessToken(userId: number): string {
    return this.jwtService.sign({ userId: userId });
  }

  async getUserInfo(request: AuthenticatedRequest): Promise<AuthEntity> {
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    const newAccessToken = this.generateAccessToken(user.id);

    return {
      user: user,
      token: newAccessToken,
      expire: this.jwtService.decode(newAccessToken).exp,
    };
  }
}
