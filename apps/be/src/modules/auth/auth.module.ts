import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersService } from './users.service';
import { SessionsService } from './sessions.service';
import { DrizzleModule } from '../database/database.module';

@Module({
  imports: [
    DrizzleModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'dev-secret',
      signOptions: { expiresIn: +process.env.JWT_ACCESS_TOKEN_TTL || '15m' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, UsersService, SessionsService],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
