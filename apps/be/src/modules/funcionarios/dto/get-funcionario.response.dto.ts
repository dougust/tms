import { ICadastro, IFuncionario } from '@dougust/database';
import { IsString } from 'class-validator';

export class GetFuncionarioResponseDto {
  funcionario: FuncionarioDto;
  cadastro: CadastroDto;
}

class FuncionarioDto implements IFuncionario {
  @IsString()
  id: string;

  @IsString()
  createdAt: Date;

  @IsString()
  updatedAt: Date;

  projetos: unknown;
}

class CadastroDto implements ICadastro {
  @IsString()
  id: string;

  @IsString()
  nomeRazao: string;

  @IsString()
  socialFantasia: string;

  @IsString()
  cpfCnpj: string;

  @IsString()
  nascimentoRegistro: string;

  @IsString()
  phone: string;

  @IsString()
  email: string;

  @IsString()
  rg: string;

  @IsString()
  createdAt: Date;

  @IsString()
  updatedAt: Date;
}
