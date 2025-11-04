import { IDiaria, IFuncionario } from '@dougust/database';

export interface IDiariaFuncionarioDto extends IFuncionario {
  diarias: Record<string, IDiaria[]>;
}

export interface IDiariaFuncionarioResultDto {
  funcionarios: IDiariaFuncionarioDto[];
}
