'use client';

import * as React from 'react';
import { useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';

import { addDays, toISODate } from '../lib';
import { IDiariaFuncionarioDto } from '@dougust/types';
import { Button, CalendarDataTable } from '@dougust/ui';
import { useDiariasControllerUpdateDiaria } from '@dougust/clients';
import { useQueryClient } from '@tanstack/react-query';

export type DiariasCalendarProps = {
  funcionarios: IDiariaFuncionarioDto[];
  fromDate: Date;
  range: number;
};

const PROJECT_ID = '532278ee-30b0-4599-7c5e-78bb13d8e63f';

export function DiariasCalendar(props: DiariasCalendarProps) {
  const { funcionarios, fromDate, range } = props;

  const queryClient = useQueryClient();
  const update = useDiariasControllerUpdateDiaria({
    mutation: {
      client: queryClient,
      onSuccess: () => {
        // Invalidate any diarias queries to refresh
        queryClient.invalidateQueries({
          queryKey: [{ url: '/diarias' }],
          exact: false,
        });
      },
      onError: (err) => {
        // Basic error reporting; keep minimal UI changes
        // eslint-disable-next-line no-console
        console.error('Falha ao atualizar diária', err);
      },
    },
  });
  const toDate = React.useMemo(() => addDays(fromDate, range), [fromDate]);

  const days = useMemo(() => {
    const list: string[] = [];
    const d = new Date(toISODate(fromDate));
    const endDate = new Date(toISODate(toDate));
    // Normalize time to avoid DST issues
    d.setUTCHours(0, 0, 0, 0);
    endDate.setUTCHours(0, 0, 0, 0);
    while (d <= endDate) {
      list.push(d.toISOString().slice(0, 10));
      d.setUTCDate(d.getUTCDate() + 1);
    }
    return list;
  }, [fromDate, toDate]);

  const columns = React.useMemo(() => {
    const result: ColumnDef<IDiariaFuncionarioDto>[] = [
      {
        accessorKey: 'nome',
        header: 'Nome',
        cell: ({ row }) => (
          <div className="capitalize">{row.getValue('nome')}</div>
        ),
      },
    ];

    for (const date of days) {
      result.push({
        accessorKey: date,
        header: date,
        cell: ({ row }) => {
          const diarias = row.original.diarias;
          const diaria = diarias[date];

          const handleClick = () => {
            // If there is already a diaria for this date, do nothing for now
            if (diaria?.length) return;
            update.mutate({
              data: {
                funcionarioId: row.original.id!,
                projetoId: PROJECT_ID,
                dia: date,
                // default to 'presente' when creating a new entry
                // Casting as any to align with generated client type that currently expects object
                tipo: 'presente' as any,
              },
            });
          };

          const content = diaria?.length ? diaria[0].projetoId : '';
          return (
            <Button
              size="sm"
              className={`capitalize ${
                diaria?.length ? '' : 'cursor-pointer hover:bg-muted/40'
              }`}
              onClick={handleClick}
            >
              {update.isPending ? content || '...' : content}
            </Button>
          );
        },
      });
    }

    return result;
  }, [days, update.isPending]);

  return <CalendarDataTable columns={columns} data={funcionarios} />;
}
