'use client';

import {
  useFuncionariosControllerFindAll,
  useFuncionariosControllerRemove,
} from '@dougust/clients';
import { DataTable } from '@dougust/ui';
import { columns } from './cloumns';
import { useRouter } from 'next/navigation';
import { ListPageLayout } from '../../../components';
import { Users } from 'lucide-react';

export default function FuncionariosPage() {
  const { data, isLoading, error, refetch } =
    useFuncionariosControllerFindAll();

  const remove = useFuncionariosControllerRemove();

  const removeEmployee = async (id: string) => {
    await remove.mutateAsync({ id });
    await refetch();
  };

  const router = useRouter();

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Funcionarios</h1>
          <p className="text-muted-foreground">
            Manage and view all funcionarios
          </p>
        </div>
        <div className="rounded-lg border border-red-200 bg-red-50 p-6">
          <p className="text-red-800">
            Error loading funcionarios: {error.message}
          </p>
        </div>
      </div>
    );
  }

  return (
    <ListPageLayout
      title="Funcionarios"
      description="Lista de funcionarios cadastrados no sistema."
      createButton={{
        text: 'Create New',
        href: '/dashboard/funcionarios/new',
      }}
      onRefreshClick={refetch}
      stats={[
        {
          title: 'Total funcionarions',
          value: isLoading ? '...' : data?.length.toString() || '0',
          icon: <Users className="h-5 w-5 text-primary" />,
        },
      ]}
    >
      <div className="rounded-lg border bg-card shadow-sm">
        <div className="border-b bg-muted/50 p-4">
          {!data ? (
            <div className="flex items-center justify-center p-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={data}
              onRemoveClick={(row) => removeEmployee(row.id)}
            />
          )}
        </div>
      </div>
    </ListPageLayout>
  );
}
