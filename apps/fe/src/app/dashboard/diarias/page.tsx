'use client';

import { useAppQuery } from '@dougust/clients';
import { ListPageLayout } from '../../../components';
import { Briefcase } from 'lucide-react';
import { IDiariaFuncionarioResultDto } from '@dougust/types';

export default function DiariasPage() {
  const { data, isLoading, error, refetch } = useAppQuery<
    IDiariaFuncionarioResultDto[]
  >({
    queryKey: ['diarias?from=2025-01-01&to=2025-12-31'],
  });

  return (
    <ListPageLayout
      title="Projetos"
      description="Lista de projetos cadastrados no sistema."
      onRefreshClick={refetch}
      stats={[
        {
          title: 'Total projetos',
          value: isLoading ? '...' : data?.length?.toString() || '0',
          icon: <Briefcase className="h-5 w-5 text-primary" />,
        },
      ]}
    ></ListPageLayout>
  );
}
