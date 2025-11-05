'use client';

import * as React from 'react';
import { useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';

import { addDays, toISODate } from '../lib';
import { Button, CalendarDataTable } from '@dougust/ui';
import { FuncionarioDto, useDiariasControllerUpdate } from '@dougust/clients';
import { useQueryClient } from '@tanstack/react-query';

export type DiariasCalendarProps = {
  funcionarios: FuncionarioDto[];
  fromDate: Date;
  range: number;
};

const PROJECT_ID = '532278ee-30b0-4599-7c5e-78bb13d8e63f';

export function DiariasCalendar(props: DiariasCalendarProps) {
  const { funcionarios, fromDate, range } = props;

  const queryClient = useQueryClient();
  const update = useDiariasControllerUpdate({
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
    const result: ColumnDef<FuncionarioDto>[] = [
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
          return <Button size="sm">empty</Button>;
        },
      });
    }

    return result;
  }, [days, update.isPending]);

  return <CalendarDataTable columns={columns} data={funcionarios} />;
}
