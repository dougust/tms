import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { LogoutDto } from './dto/logout.dto';
import { Public } from '../../common';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('login')
  @Public()
  async login(@Body() dto: LoginDto, @Req() req: any) {
    const meta = {
      ipAddress: req.ip as string | undefined,
      userAgent: (req.get
        ? req.get('user-agent')
        : req.headers['user-agent']) as string | undefined,
    };
    const result = await this.auth.login(dto.email, dto.password, meta);
    if (!result) throw new UnauthorizedException('Invalid credentials');
    return result;
  }

  @Post('refresh')
  async refresh(@Body() dto: RefreshDto, @Req() req: any) {
    const meta = {
      ipAddress: req.ip as string | undefined,
      userAgent: (req.get
        ? req.get('user-agent')
        : req.headers['user-agent']) as string | undefined,
    };
    return await this.auth.refresh(dto.refreshToken, meta);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Body() dto: LogoutDto) {
    if (dto.refreshToken) {
      await this.auth.logout(dto.refreshToken);
    }
    return;
  }
}
