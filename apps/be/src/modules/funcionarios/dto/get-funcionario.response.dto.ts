import { IsDate, IsDateString, IsNumber, IsString } from 'class-validator';

export class GetFuncionarioResponseDto {
  funcionario: FuncionarioDto;
}

export class FuncionarioDto {
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
  dependetes: number;

  @IsString()
  projetoId: string;

  @IsDate()
  createdAt: Date;

  @IsDate()
  updatedAt: Date;
}
