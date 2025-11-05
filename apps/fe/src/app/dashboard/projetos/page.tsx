'use client';

import { ProjetoDto, useProjetosControllerFindAll } from '@dougust/clients';
import { DataTable } from '@dougust/ui';
import { columns } from './cloumns';
import { ErrorPanel, ListPageLayout } from '../../../components';
import { Briefcase } from 'lucide-react';

export default function ProjetosPage() {
  const { data, isLoading, error, refetch } =
    useProjetosControllerFindAll<ProjetoDto[]>();

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
    >
      <div className="rounded-lg border bg-card shadow-sm">
        <div className="border-b bg-muted/50 p-4">
          {error ? (
            <ErrorPanel message={`Error loading projetos: ${error.message}`} />
          ) : !data ? (
            <div className="flex items-center justify-center p-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : (
            <DataTable columns={columns} data={data} />
          )}
        </div>
      </div>
    </ListPageLayout>
  );
}
