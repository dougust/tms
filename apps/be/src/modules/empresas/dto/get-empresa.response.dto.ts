import { IEmpresa } from '@dougust/database';
import { IsString } from 'class-validator';

export class GetEmpresaResponseDto {
  empresa: EmpresaDto;
}

export class EmpresaDto implements IEmpresa {
  @IsString()
  id: string;

  @IsString()
  razao: string;

  @IsString()
  fantasia: string;

  @IsString()
  cnpj: string;

  @IsString()
  registro: string;

  @IsString()
  phone: string;

  @IsString()
  email: string;

  @IsString()
  createdAt: Date;

  @IsString()
  updatedAt: Date;
}
