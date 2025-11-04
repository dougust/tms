import { IProjeto, IEmpresa } from '@dougust/database';

export interface IProjetoListDto {
  projeto: IProjeto;
  empresa: IEmpresa;
}
