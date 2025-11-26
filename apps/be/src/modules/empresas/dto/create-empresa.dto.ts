import {
  IsDateString,
  IsEmail,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { IsUnique } from '../../../common/cadastros/isUniqueConstraint';
import { empresas } from '@dougust/database';

export class CreateEmpresaDto {
  @IsOptional()
  @IsString()
  @Length(1, 100)
  razao?: string;

  @IsOptional()
  @IsString()
  @Length(0, 100)
  fantasia?: string;

  @IsString()
  @IsUnique(empresas, 'cnpj', { message: 'CNPJ ja cadastrado' })
  @Length(1, 15)
  cnpj!: string;

  @IsOptional()
  @IsDateString()
  registro?: string;

  @IsOptional()
  @IsString()
  @Length(0, 20)
  phone?: string;

  @IsEmail()
  @IsUnique(empresas, 'email', { message: 'Email ja cadastrado' })
  email!: string;
}
