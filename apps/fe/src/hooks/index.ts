import { useFuncionariosControllerFindAll } from '@dougust/clients';

export const useFuncionariosQuery = () =>
  useFuncionariosControllerFindAll({
    query: {
      initialData: () => [],
    },
  });
