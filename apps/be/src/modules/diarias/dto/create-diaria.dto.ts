import { IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateDiariaDto {
  @IsString()
  projetoId: string;

  @IsString()
  funcionarioId: string;

  @IsDateString()
  dia: string;

  @IsOptional()
  @IsString()
  tipoDiariaId?: string | null;
}
