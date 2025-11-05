'use client';

import {
  useEmpresasControllerFindAll,
  useEmpresasControllerRemove,
} from '@dougust/clients';
import { DataTable } from '@dougust/ui';
import { columns } from './cloumns';
import { ErrorPanel, ListPageLayout } from '../../../components';
import { Building2 } from 'lucide-react';

export default function EmpresasPage() {
  const { data, isLoading, error, refetch } = useEmpresasControllerFindAll();

  const remove = useEmpresasControllerRemove();

  const removeEmpresa = async (id: string) => {
    await remove.mutateAsync({ id });
    await refetch();
  };

  return (
    <ListPageLayout
      title="Empresas"
      description="Lista de empresas cadastradas no sistema."
      createButton={{
        text: 'Create New',
        href: '/dashboard/empresas/new',
      }}
      onRefreshClick={refetch}
      stats={[
        {
          title: 'Total de empresas',
          value: isLoading ? '...' : data?.length.toString() || '0',
          icon: <Building2 className="h-5 w-5 text-primary" />,
        },
      ]}
    >
      <div className="rounded-lg border bg-card shadow-sm">
        <div className="border-b bg-muted/50 p-4">
          {error ? (
            <ErrorPanel message={`Error loading empresas: ${error.message}`} />
          ) : !data ? (
            <div className="flex items-center justify-center p-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={data}
              onRemoveClick={(row) => removeEmpresa((row as any).id)}
            />
          )}
        </div>
      </div>
    </ListPageLayout>
  );
}
