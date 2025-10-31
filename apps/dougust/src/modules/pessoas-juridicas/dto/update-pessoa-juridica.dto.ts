import { PartialType } from '@nestjs/mapped-types';
import { CreatePessoaJuridicaDto } from './create-pessoa-juridica.dto';

export class UpdatePessoaJuridicaDto extends PartialType(CreatePessoaJuridicaDto) {}
