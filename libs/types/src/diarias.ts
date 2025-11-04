import {
  IDiaria,
  IDiariaFuncionarioRel,
  IFuncionario,
} from '@dougust/database';

export interface IDiariaDto extends IDiaria, IDiariaFuncionarioRel {}

export interface IDiariaFuncionarioDto extends IFuncionario {
  diarias: Record<string, IDiariaDto[]>;
}

export interface IDiariaFuncionarioResultDto {
  funcionarios: IDiariaFuncionarioDto[];
}
