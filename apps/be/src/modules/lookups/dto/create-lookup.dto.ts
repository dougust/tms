import { IsOptional, IsString } from 'class-validator';

export class CreateLookupDto {
  @IsString()
  grupo!: string;

  @IsOptional()
  @IsString()
  id?: string;

  @IsString()
  nome!: string;
}
