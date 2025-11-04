import { IsDateString, IsOptional, IsString } from 'class-validator';
import { IDiariaLabel } from '@dougust/database';

export class UpdateDiariaDto {
  @IsString()
  funcionarioId: string;

  @IsString()
  projetoId: string;

  @IsDateString()
  dia: string;

  @IsOptional()
  @IsString()
  tipo: IDiariaLabel;
}
