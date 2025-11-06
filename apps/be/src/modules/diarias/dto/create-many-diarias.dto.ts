import { IsArray } from 'class-validator';
import { CreateDiariaDto } from './create-diaria.dto';

export class CreateManyDiariasDto {
  @IsArray()
  items: CreateDiariaDto[];
}
