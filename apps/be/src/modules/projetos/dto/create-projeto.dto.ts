import { IsDateString, IsOptional, IsString, Length } from 'class-validator';
import { IsUnique } from '../../../common/cadastros/isUniqueConstraint';
import { projetos } from '@dougust/database';

export class CreateProjetoDto {
  @IsOptional()
  @IsString()
  empresaId?: string;

  @IsString()
  @Length(1, 100)
  @IsUnique(projetos, 'nome', { message: 'Nome de projeto já cadastrado' })
  nome!: string;

  @IsDateString()
  inicio!: string;

  @IsDateString()
  fim!: string;
}
