'use client';

import * as React from 'react';
import { useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';

import { reduceToRecord } from '../lib';
import {
  Button,
  CalendarDataTable,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@dougust/ui';
import {
  CreateDiariaDto,
  DiariaDto,
  DiariasControllerFindInRangeQueryParams,
  FuncionarioDto,
  ProjetoDto,
} from '@dougust/clients';
import { Badge } from '@dougust/ui/components/badge';
import { useCreateDiaria, useUpdateDiaria } from '../hooks';

export type DiariasCalendarProps = {
  funcionarios: FuncionarioDto[];
  projetos: ProjetoDto[];
  diarias: DiariaDto[];
  range: DiariasControllerFindInRangeQueryParams;
};

export function DiariasCalendar(props: DiariasCalendarProps) {
  const { funcionarios, diarias, projetos, range } = props;

  const createMutation = useCreateDiaria(range);
  const updateMutation = useUpdateDiaria(range);

  // Dialog state for changing projeto of a diária
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [selectedDiaria, setSelectedDiaria] = React.useState<DiariaDto | null>(
    null
  );
  const [selectedProjetoId, setSelectedProjetoId] = React.useState<string>('');

  const onCreateClick = async (data: CreateDiariaDto) => {
    createMutation.mutate({ data });
  };

  const onConfirmProjetoChange = () => {
    if (!selectedDiaria || !selectedProjetoId) return;
    updateMutation.mutate({
      id: selectedDiaria.id,
      data: {
        funcionarioId: selectedDiaria.funcionarioId,
        projetoId: selectedProjetoId,
        dia: selectedDiaria.dia,
      },
    });
    setDialogOpen(false);
    setSelectedDiaria(null);
  };

  const projetosRecord = React.useMemo(
    () => reduceToRecord(projetos),
    [projetos]
  );

  const diariasPorFuncionario: Map<
    string,
    Map<string, DiariaDto>
  > = React.useMemo(
    () =>
      diarias.reduce((acc, diaria) => {
        if (
          acc.has(diaria.funcionarioId) ||
          acc.set(diaria.funcionarioId, new Map())
        ) {
          acc.get(diaria.funcionarioId)?.set(diaria.dia, diaria);
        }
        return acc;
      }, new Map<string, Map<string, DiariaDto>>()),
    [diarias]
  );

  const days = useMemo(() => {
    const list: string[] = [];
    const d = new Date(range.from);
    const endDate = new Date(range.to);
    // Normalize time to avoid DST issues
    d.setUTCHours(0, 0, 0, 0);
    endDate.setUTCHours(0, 0, 0, 0);
    while (d <= endDate) {
      list.push(d.toISOString().slice(0, 10));
      d.setUTCDate(d.getUTCDate() + 1);
    }
    return list;
  }, [range]);

  const columns = React.useMemo(() => {
    const result: ColumnDef<FuncionarioDto>[] = [
      {
        accessorKey: 'nome',
        header: 'Nome',
        cell: ({ row }) => {
          const projetoId = row.original.projetoId;
          const projeto = projetosRecord[projetoId];

          return (
            <div className="capitalize">
              {row.getValue('nome')}
              {projeto && (
                <div className="text-xs text-muted-foreground">
                  {projeto.nome}
                </div>
              )}
            </div>
          );
        },
      },
    ];

    for (const dia of days) {
      result.push({
        accessorKey: dia,
        header: dia,
        cell: ({ row }) => {
          if (new Date(dia) > new Date()) {
            return <div className="text-muted-foreground "></div>;
          }

          const { id: funcionarioId, projetoId } = row.original;
          const diaria = diariasPorFuncionario.get(funcionarioId)?.get(dia);
          const projetDiaria = diaria && projetosRecord[diaria.projetoId].nome;

          return (
            <div className="flex flex-col gap-1 items-stretch">
              {diaria && (
                <>
                  <Badge
                    variant="outline"
                    className="cursor-pointer"
                    onClick={() => {
                      if (!diaria) return;
                      setSelectedDiaria(diaria);
                      setSelectedProjetoId(diaria.projetoId ?? '');
                      setDialogOpen(true);
                    }}
                  >
                    {projetDiaria}
                  </Badge>
                  {diaria?.tipoDiariaId ? (
                    <Badge variant="secondary">com tipo</Badge>
                  ) : (
                    <Badge>presente</Badge>
                  )}
                </>
              )}
              {!diaria && (
                <Button
                  onClick={() =>
                    onCreateClick({ funcionarioId, projetoId, dia })
                  }
                >
                  add
                </Button>
              )}
            </div>
          );
        },
      });
    }

    return result;
  }, [days, updateMutation.isPending, diarias]);

  return (
    <>
      <CalendarDataTable columns={columns} data={funcionarios} />
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alterar projeto da diária</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <label className="text-sm text-muted-foreground">Projeto</label>
            <select
              className="border rounded-md px-3 py-2 bg-background"
              value={selectedProjetoId}
              onChange={(e) => setSelectedProjetoId(e.target.value)}
            >
              <option value="" disabled>
                Selecione um projeto
              </option>
              {projetos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome}
                </option>
              ))}
            </select>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button
              onClick={onConfirmProjetoChange}
              disabled={!selectedProjetoId || updateMutation.isPending}
            >
              {updateMutation.isPending ? 'Salvando...' : 'Confirmar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
