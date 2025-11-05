import { useFuncionariosControllerFindAll } from '@dougust/clients';

export * from './useCreateDiaria';
export * from './useUpdateDiaria';

export const useFuncionariosQuery = () =>
  useFuncionariosControllerFindAll({
    query: {
      initialData: () => [],
    },
  });
