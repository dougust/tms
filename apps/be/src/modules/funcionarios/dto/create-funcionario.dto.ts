import {
  IsDateString,
  IsEmail,
  IsOptional,
  IsString,
  Length,
  IsInt,
  IsDate,
  IsNumber,
} from 'class-validator';
import { IsUnique } from '../../../common/cadastros/isUniqueConstraint';
import { funcionarios, beneficios, lookup } from '@dougust/database';

export class CreateFuncionarioDto {
  @IsOptional()
  @IsString()
  @Length(1, 100)
  nome?: string;

  @IsOptional()
  @IsString()
  @Length(0, 100)
  social?: string;

  @IsString()
  @IsUnique(funcionarios, 'cpf', { message: 'CPF ja cadastrado' })
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
  @IsUnique(funcionarios, 'email', { message: 'Email ja cadastrado' })
  email!: string;

  @IsString()
  projetoId: string;

  @IsOptional()
  @IsString()
  @Length(0, 11)
  rg?: string;

  @IsOptional()
  @IsString()
  @Length(0, 30)
  funcao: string;

  @IsOptional()
  @IsInt()
  dependetes: number;

  @IsOptional()
  @IsNumber()
  valorCafe?: number;

  @IsOptional()
  @IsNumber()
  valorSaudeOcupacional?: number;

  @IsOptional()
  @IsNumber()
  valorSaudePlano?: number;

  @IsOptional()
  @IsNumber()
  valorJanta?: number;

  @IsOptional()
  @IsNumber()
  valorDescontoCasa?: number;
}
