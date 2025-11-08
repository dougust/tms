import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from './users.service';
import { SessionsService } from './sessions.service';
import { users as usersTable } from '@dougust/database';

type User = typeof usersTable.$inferSelect;

type Meta = { ipAddress?: string; userAgent?: string };

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly sessions: SessionsService,
    private readonly jwt: JwtService
  ) {}

  private signAccessToken(user: Pick<User, 'id' | 'email'>) {
    const payload = { sub: user.id, email: user.email };
    return this.jwt.sign(payload);
  }

  async login(email: string, password: string, meta?: Meta) {
    const user = await this.users.findByEmail(email);
    if (!user || !user.isActive) return null;
    const ok = await this.users.verifyPassword(user.passwordHash, password);
    if (!ok) return null;

    await this.users.updateLastLogin(user.id, new Date());

    const accessToken = this.signAccessToken(user);
    const refreshToken = this.sessions.generateRefreshToken();
    await this.sessions.create(user.id, refreshToken, meta);

    return {
      accessToken,
      refreshToken,
      user: { id: user.id, email: user.email, fullName: user.fullName ?? null },
    };
  }

  async refresh(refreshToken: string, meta?: Meta) {
    const session = await this.sessions.findValidByToken(refreshToken);
    if (!session) throw new UnauthorizedException('Invalid refresh token');

    const userId = session.userId as string;
    const user = await this.users.findById(userId);
    if (!user || !user.isActive) {
      // Revoke this session if user is missing/inactive to prevent reuse
      await this.sessions.deleteByToken(refreshToken);
      throw new UnauthorizedException('Invalid refresh token');
    }

    const accessToken = this.signAccessToken({
      id: user.id,
      email: user.email,
    });
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
