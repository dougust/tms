import { PartialType } from '@nestjs/swagger';
import { CreateDiariaDto } from './create-diaria.dto';

export class UpdateDiariaDto extends PartialType(CreateDiariaDto) {}
