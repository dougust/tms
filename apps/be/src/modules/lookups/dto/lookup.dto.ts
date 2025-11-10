import { IsDate, IsInt, IsOptional, IsString } from 'class-validator';

export class LookupDto {
  @IsString()
  grupo!: string;

  @IsString()
  id!: string;

  @IsString()
  nome!: string;

  @IsOptional()
  @IsDate()
  createdAt?: Date;

  @IsOptional()
  @IsDate()
  updatedAt?: Date;
}
