'use client';

import {
  useFuncionariosControllerFindAll,
  useFuncionariosControllerRemove,
} from '@dougust/clients';
import { Button, DataTable } from '@dougust/ui';
import { Plus, RefreshCw, Users } from 'lucide-react';
import { columns } from './cloumns';
import { useRouter } from 'next/navigation';

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Funcionarios</h1>
          <p className="text-muted-foreground">
            Manage and view all funcionarios
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={() => router.push('/dashboard/funcionarios/new')}>
            <Plus className="h-4 w-4" />
            Create New
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between space-x-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Total Funcionarios
              </p>
              <p className="text-2xl font-bold">
                {isLoading ? '...' : data?.length || 0}
              </p>
            </div>
            <div className="rounded-full bg-primary/10 p-3">
              <Users className="h-5 w-5 text-primary" />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-card shadow-sm">
        <div className="border-b bg-muted/50 p-4">
          <h2 className="text-lg font-semibold">All Funcionarios</h2>
        </div>
        {!data ? (
          <div className="flex items-center justify-center p-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={data}
            onRemoveClick={(row) => removeEmployee(row.funcionario.id)}
          />
        )}
      </div>
    </div>
  );
}
