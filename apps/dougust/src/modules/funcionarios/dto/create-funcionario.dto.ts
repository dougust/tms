import {
  IsDateString,
  IsEmail,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { IsUnique } from '../../../common/cadastros/isUniqueConstraint';
import { cadastros } from '@dougust/database';

export class CreateFuncionarioDto {
  // Cadastro fields
  @IsOptional()
  @IsString()
  @Length(1, 100)
  nome?: string;

  @IsOptional()
  @IsString()
  @Length(0, 100)
  social?: string;

  @IsString()
  @IsUnique(cadastros, 'cpfCnpj', { message: 'CPF ja cadastrado' })
  @Length(1, 15)
  cpf!: string;

  @IsOptional()
  @IsDateString()
  nascimento?: string;

  @IsOptional()
  @IsString()
  @Length(0, 20)
  phone?: string;

  @IsEmail()
  @IsUnique(cadastros, 'email', { message: 'Email ja cadastrado' })
  email!: string;

  @IsOptional()
  @IsString()
  @Length(0, 11)
  rg?: string;
}
