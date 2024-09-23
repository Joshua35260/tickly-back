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
  user?: User; // Change `any` to the type of your user object if you have it defined
}
@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(login: string, password: string): Promise<AuthEntity> {
    // Step 1: Fetch a user with the given email
    const user = await this.prisma.user.findUnique({ where: { login: login } });

    // If no user is found, throw an error
    if (!user) {
      throw new NotFoundException(`No user found for email: ${login}`);
    }

    // Step 2: Check if the password is correct
    const isPasswordValid = await bcrypt.compare(password, user.password);

    // If password does not match, throw an error
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }
    delete user.password;
    // Step 3: Generate a JWT containing the user's ID, token, and expiration, and return it
    const accessToken = this.generateAccessToken(user.id);
    return {
      token: accessToken,
      expire: this.jwtService.decode(accessToken).exp, // Get the expiration time from the decoded token
      user: user,
      // You can include additional user information here if needed
    };
  }

  private generateAccessToken(userId: number): string {
    // Generate a JWT containing the user's ID, token, and expiration
    return this.jwtService.sign({ userId: userId });
  }

  async getUserInfo(request: AuthenticatedRequest): Promise<AuthEntity> {
    // Get the authenticated user from the request object
    const user = request.user;
    // Check if the user is authenticated
    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    // Get the authorization header from the request
    const authorizationHeader = request.headers.get('authorization');

    // Check if the authorization header exists
    if (!authorizationHeader) {
      throw new UnauthorizedException('Authorization header not provided');
    }

    // Extract the token from the authorization header
    const token = authorizationHeader.split(' ')[1];

    // Decode the token and check if it exists and is valid
    const decodedToken = this.jwtService.decode(token);
    if (!decodedToken) {
      throw new UnauthorizedException('Invalid token');
    }

    // Return the user information along with the token and expiration
    return {
      user: user,
      token: token,
      expire: decodedToken.exp, // Access the expiration time from the decoded token
    };
  }
}
