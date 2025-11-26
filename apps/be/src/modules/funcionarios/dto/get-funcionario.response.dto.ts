import {
  IsDate,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { IFuncionario } from '@dougust/database';

export class GetFuncionarioResponseDto {
  funcionario: FuncionarioDto;
}

export class FuncionarioDto implements IFuncionario {
  @IsString()
  id: string;

  @IsString()
  nome: string;

  @IsString()
  social: string;

  @IsString()
  cpf: string;

  @IsDateString()
  nascimento: string;

  @IsString()
  phone: string;

  @IsString()
  email: string;

  @IsString()
  rg: string;

  @IsString()
  funcao: string;

  @IsNumber()
  salario: number;

  @IsNumber()
  dependetes: number;

  @IsString()
  projetoId: string;

  @IsDate()
  createdAt: Date;

  @IsDate()
  updatedAt: Date;

  @IsNumber()
  decimoTerceiro: number;

  @IsNumber()
  ferias: number;
}
