'use client';

import * as React from 'react';
import { useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';

import { addDays, toISODate } from '../lib';
import { Checkbox } from '@dougust/ui';
import { IDiariaFuncionarioDto } from '@dougust/types';
import { CalendarDataTable } from '@dougust/ui';

export type DiariasCalendarProps = {
  funcionarios: IDiariaFuncionarioDto[];
  fromDate: Date;
  range: number;
};

export function DiariasCalendar(props: DiariasCalendarProps) {
  const { funcionarios, fromDate, range } = props;

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

          return (
            <div className="capitalize">
              {diaria?.length > 0 ? diaria[0].tipo : ''}
            </div>
          );
        },
      });
    }

    return result;
  }, [days]);

  return <CalendarDataTable columns={columns} data={funcionarios} />;
}
