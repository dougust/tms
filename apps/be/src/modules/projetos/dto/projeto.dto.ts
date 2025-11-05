import { IProjeto } from '@dougust/database';
import { IsDate, IsString } from 'class-validator';

export class ProjetoDto implements IProjeto {
  @IsString()
  id: string;

  @IsString()
  empresa_id: string;

  @IsString()
  nome: string;

  @IsString()
  inicio: string;

  @IsString()
  fim: string;

  @IsDate()
  createdAt: Date;

  @IsDate()
  updatedAt: Date;
}
