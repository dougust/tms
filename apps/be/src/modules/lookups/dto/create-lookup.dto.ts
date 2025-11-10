import { IsString } from 'class-validator';

export class CreateLookupDto {
  @IsString()
  grupo!: string;

  @IsString()
  nome!: string;
}
