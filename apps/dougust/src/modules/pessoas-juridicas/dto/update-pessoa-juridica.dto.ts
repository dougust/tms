import { PartialType } from '@nestjs/swagger';
import { CreatePessoaJuridicaDto } from './create-pessoa-juridica.dto';

export class UpdatePessoaJuridicaDto extends PartialType(CreatePessoaJuridicaDto) {}
