'use client';

import * as React from 'react';
import { useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';

import { reduceToRecord } from '../lib';
import { Button, CalendarDataTable } from '@dougust/ui';
import { Badge } from '@dougust/ui/components/badge';
import {
  CreateDiariaDto,
  DiariaDto,
  DiariasControllerFindInRangeQueryParams,
  FuncionarioDto,
  ProjetoDto,
  TipoDiariaDto,
} from '@dougust/clients';
import { useCreateDiaria, useUpdateDiaria } from '../hooks';
import { ProjetoDiariaDialog } from './projeto-diaria-dialog';
import { TipoDiariaDialog } from './tipo-diaria-dialog';

export type DiariasCalendarProps = {
  funcionarios: FuncionarioDto[];
  projetos: ProjetoDto[];
  diarias: DiariaDto[];
  tiposDiarias: TipoDiariaDto[];
  range: DiariasControllerFindInRangeQueryParams;
};

export function DiariasCalendar(props: DiariasCalendarProps) {
  const { funcionarios, diarias, projetos, tiposDiarias, range } = props;

  const today = React.useMemo(() => new Date(), []);

  const createMutation = useCreateDiaria(range);
  const updateMutation = useUpdateDiaria(range);

  // Dialog state for changing projeto of a diária
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [selectedDiaria, setSelectedDiaria] = React.useState<DiariaDto | null>(
    null
  );
  const [selectedProjetoId, setSelectedProjetoId] = React.useState<string>('');

  // Dialog state for changing tipoDiaria of a diária
  const [tipoDialogOpen, setTipoDialogOpen] = React.useState(false);
  const [selectedTipoDiariaId, setSelectedTipoDiariaId] =
    React.useState<string>('');

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

  const onConfirmTipoChange = () => {
    if (!selectedDiaria || !selectedTipoDiariaId) return;
    updateMutation.mutate({
      id: selectedDiaria.id,
      // Cast to any to allow optional tipoDiariaId until clients are regenerated
      data: {
        funcionarioId: selectedDiaria.funcionarioId,
        projetoId: selectedDiaria.projetoId,
        dia: selectedDiaria.dia,
        tipoDiariaId: selectedTipoDiariaId,
      } as any,
    });
    setTipoDialogOpen(false);
    setSelectedDiaria(null);
  };

  const projetosRecord = React.useMemo(
    () => reduceToRecord(projetos),
    [projetos]
  );

  const tiposRecord = React.useMemo(
    () => reduceToRecord(tiposDiarias),
    [tiposDiarias]
  );

  const funcionariosRecord = React.useMemo(
    () => reduceToRecord(funcionarios),
    [funcionarios]
  );

  const dialogTitle = React.useMemo(() => {
    if (!selectedDiaria) return undefined;
    const nome = funcionariosRecord[selectedDiaria.funcionarioId]?.nome;
    const dia = selectedDiaria.dia;
    if (!nome || !dia) return undefined;
    return `Atualizar Diaria ${dia} de ${nome}`;
  }, [selectedDiaria, funcionariosRecord]);

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
    const list: Date[] = [];
    const dateIterator = new Date(range.from);
    const endDate = new Date(range.to);
    dateIterator.setUTCHours(0, 0, 0, 0);
    endDate.setUTCHours(0, 0, 0, 0);
    while (dateIterator <= endDate) {
      list.push(new Date(dateIterator));
      dateIterator.setUTCDate(dateIterator.getUTCDate() + 1);
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

    for (const day of days) {
      const isFuture = day > today;
      const dia = day.toISOString().slice(0, 10);

      result.push({
        accessorKey: dia,
        header: dia,
        meta: isFuture
          ? {
              cellClassName:
                'relative text-muted-foreground select-none cursor-not-allowed bg-gray-900/20',
            }
          : undefined,
        cell: ({ row }) => {
          if (isFuture) {
            return null;
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
                    <Badge
                      variant="destructive"
                      className="cursor-pointer"
                      onClick={() => {
                        if (!diaria) return;
                        setSelectedDiaria(diaria);
                        setSelectedTipoDiariaId(diaria.tipoDiariaId ?? '');
                        setTipoDialogOpen(true);
                      }}
                    >
                      {tiposRecord[diaria.tipoDiariaId]?.nome ?? 'com tipo'}
                    </Badge>
                  ) : (
                    <Badge
                      className="cursor-pointer"
                      onClick={() => {
                        setSelectedDiaria(diaria);
                        setSelectedTipoDiariaId('');
                        setTipoDialogOpen(true);
                      }}
                    >
                      presente
                    </Badge>
                  )}
                </>
              )}
              {!diaria && (
                <Button
                  onClick={() =>
                    onCreateClick({
                      funcionarioId,
                      projetoId,
                      dia,
                    })
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
      <ProjetoDiariaDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        projetos={projetos}
        selectedProjetoId={selectedProjetoId}
        onSelectedProjetoIdChange={setSelectedProjetoId}
        onConfirm={onConfirmProjetoChange}
        isSaving={updateMutation.isPending}
        title={dialogTitle}
      />
      <TipoDiariaDialog
        open={tipoDialogOpen}
        onOpenChange={setTipoDialogOpen}
        tipos={tiposDiarias}
        selectedTipoDiariaId={selectedTipoDiariaId}
        onSelectedTipoDiariaIdChange={setSelectedTipoDiariaId}
        onConfirm={onConfirmTipoChange}
        isSaving={updateMutation.isPending}
        title={dialogTitle}
      />
    </>
  );
}
