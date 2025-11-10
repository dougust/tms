import { IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateDiariaDto {
  @IsString()
  projetoId: string;

  @IsString()
  funcionarioId: string;

  @IsDateString()
  dia: string;

  @IsOptional()
  @IsString()
  tipoDiaria?: string;
}
