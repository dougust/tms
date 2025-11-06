import { ITipoDiaria } from '@dougust/database';
import { IsDate, IsString } from 'class-validator';

export class TipoDiariaDto implements ITipoDiaria {
  @IsString()
  id: string;

  @IsString()
  nome: string;

  @IsDate()
  createdAt: Date;

  @IsDate()
  updatedAt: Date;
}
