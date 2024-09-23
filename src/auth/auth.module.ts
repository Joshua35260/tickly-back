import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from 'prisma/prisma.module';
import { UserModule } from 'src/user/user.module';
import { JwtStrategy } from './jwt.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(), // Chargez les variables d'environnement
    PrismaModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule], // Importez ConfigModule pour utiliser ConfigService
      inject: [ConfigService], // Injectez ConfigService
      useFactory: async (configService: ConfigService) => ({
        // Utilisez ConfigService pour obtenir la clé secrète
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRATION_TIME'),
        },
      }),
    }),
    UserModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
