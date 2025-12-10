import {
  IsDateString,
  IsEmail,
  IsOptional,
  IsString,
  Length,
  IsInt,
  IsNumber,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { IsUnique } from '../../../common/cadastros/isUniqueConstraint';
import { funcionarios } from '@dougust/database';

export class FuncionarioBeneficioDto {
  @IsString()
  lookupId!: string;

  @IsNumber()
  valor!: number;
}

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
  @ValidateNested({ each: true })
  @Type(() => FuncionarioBeneficioDto)
  beneficios?: FuncionarioBeneficioDto[];
}
