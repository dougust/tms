import { IsDate, IsInt, IsOptional, IsString } from 'class-validator';

export class LookupDto {
  @IsString()
  grupo!: string;

  @IsInt()
  key!: number;

  @IsString()
  nome!: string;

  @IsOptional()
  @IsDate()
  createdAt?: Date;

  @IsOptional()
  @IsDate()
  updatedAt?: Date;
}
