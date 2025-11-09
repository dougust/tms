import { IsEmail, IsString } from 'class-validator';

export class AuthResponseDto {
  @IsEmail()
  accessToken!: string;

  @IsString()
  refreshToken!: string;
}
