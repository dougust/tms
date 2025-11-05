'use client';

import * as React from 'react';
import { useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';

import { reduceToRecord } from '../lib';
import { Button, CalendarDataTable } from '@dougust/ui';
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

const PROJECT_ID = '532278ee-30b0-4599-7c5e-78bb13d8e63f';

export function DiariasCalendar(props: DiariasCalendarProps) {
  const { funcionarios, diarias, projetos, range } = props;

  const createMutation = useCreateDiaria(range);
  const updateMutation = useUpdateDiaria(range);

  const onCreateClick = async (data: CreateDiariaDto) => {
    createMutation.mutate({ data });
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
              {projetDiaria && <Badge variant="outline">{projetDiaria}</Badge>}
              {diaria?.tipoDiariaId && (
                <Badge variant="secondary">com tipo</Badge>
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

  return <CalendarDataTable columns={columns} data={funcionarios} />;
}
