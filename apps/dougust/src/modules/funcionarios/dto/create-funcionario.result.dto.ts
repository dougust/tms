import { ICadastro, IFuncionario } from '@dougust/database';

export interface CreateFuncionarioResultDto extends IFuncionario {
  cadastro: ICadastro;
}
