import { IsDateString, IsOptional, IsString } from 'class-validator';

export class UpdateDiariaDto {
  @IsString()
  funcionarioId: string;

  @IsString()
  projetoId: string;

  @IsDateString()
  dia: string;

  @IsOptional()
  @IsString()
  tipo: string;
}
