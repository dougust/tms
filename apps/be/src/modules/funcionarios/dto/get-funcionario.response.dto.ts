import { IFuncionario } from '@dougust/database';
import { IsString } from 'class-validator';

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

  @IsString()
  nascimento: string;

  @IsString()
  phone: string;

  @IsString()
  email: string;

  @IsString()
  rg: string;

  @IsString()
  projetoId: string;

  @IsString()
  createdAt: Date;

  @IsString()
  updatedAt: Date;
}
