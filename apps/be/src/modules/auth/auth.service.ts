import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from './users.service';
import { SessionsService } from './sessions.service';
import { users as usersTable } from '@dougust/database';
import { JwtUser } from '../../common';

type User = typeof usersTable.$inferSelect;

type Meta = { ipAddress?: string; userAgent?: string };

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly sessions: SessionsService,
    private readonly jwt: JwtService
  ) {}

  private generatePayload(user: Pick<User, 'id' | 'email'>): JwtUser {
    return {
      sub: user.id,
      email: user.email,
    };
  }

  async login(email: string, password: string, meta?: Meta) {
    const user = await this.users.findByEmail(email);
    if (!user || !user.isActive) return null;
    const ok = await this.users.verifyPassword(user.passwordHash, password);
    if (!ok) return null;

    await this.users.updateLastLogin(user.id, new Date());

    const payload = this.generatePayload(user);
    const accessToken = this.jwt.sign(payload);
    const refreshToken = this.sessions.generateRefreshToken();
    await this.sessions.create(user.id, refreshToken, meta);

    return {
      accessToken,
      refreshToken,
      user: payload,
    };
  }

  async refresh(refreshToken: string, meta?: Meta) {
    const session = await this.sessions.findValidByToken(refreshToken);
    if (!session) throw new UnauthorizedException('Invalid refresh token');
    const { userId, user } = session;

    if (!user || !user.isActive) {
      // Revoke this session if user is missing/inactive to prevent reuse
      await this.sessions.deleteByToken(refreshToken);
      throw new UnauthorizedException('Invalid refresh token');
    }

    const payload = this.generatePayload(user);
    const accessToken = this.jwt.sign(payload);
    const { newToken } = await this.sessions.rotate(
      session.id as string,
      userId,
      refreshToken,
      meta
    );

    return { accessToken, refreshToken: newToken };
  }

  async logout(refreshToken: string) {
    await this.sessions.deleteByToken(refreshToken);
  }
}
