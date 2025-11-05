import { IDiaria } from '@dougust/database';
import { IsDate, IsDateString, IsString } from 'class-validator';

export class DiariaEntity implements IDiaria {
  @IsString()
  id: string;

  @IsDateString()
  dia: string;

  @IsString()
  funcionarioId: string;

  @IsString()
  projetoId: string;

  @IsString()
  tipoDiariaId: string;

  @IsString()
  observacoes: string;

  @IsDate()
  createdAt: Date;

  @IsDate()
  updatedAt: Date;
}
