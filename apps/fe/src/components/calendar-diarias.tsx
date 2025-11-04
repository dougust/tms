import React, { useMemo } from 'react';
import { DataTable } from '@dougust/ui';
import type { ColumnDef } from '@tanstack/react-table';

export type CalendarRow = {
  id: string;
  label: React.ReactNode;
  // Map of ISO date (YYYY-MM-DD) to cell content
  cells: Record<string, React.ReactNode | undefined>;
};

export type CalendarDiariasProps = {
  rows: CalendarRow[];
  start: string | Date;
  end: string | Date;
  loading?: boolean;
  error?: unknown;
  firstColumnLabel?: React.ReactNode;
};

const toISODate = (d: string | Date): string => {
  if (typeof d === 'string') return d.slice(0, 10);
  return new Date(d).toISOString().slice(0, 10);
};

const formatDay = (iso: string) => {
  const [y, m, day] = iso.split('-');
  return `${day}/${m}`;
};

export const CalendarDiarias: React.FC<CalendarDiariasProps> = ({
  rows,
  start,
  end,
  loading,
  error,
  firstColumnLabel = 'Funcionário',
}) => {
  const startIso = toISODate(start);
  const endIso = toISODate(end);

  // Build continuous list of days between start and end (inclusive)
  const days = useMemo(() => {
    const list: string[] = [];
    const d = new Date(startIso);
    const endDate = new Date(endIso);
    // Normalize time to avoid DST issues
    d.setUTCHours(0, 0, 0, 0);
    endDate.setUTCHours(0, 0, 0, 0);
    while (d <= endDate) {
      list.push(d.toISOString().slice(0, 10));
      d.setUTCDate(d.getUTCDate() + 1);
    }
    return list;
  }, [startIso, endIso]);

  const columns: ColumnDef<CalendarRow, unknown>[] = useMemo(() => {
    const cols: ColumnDef<CalendarRow, unknown>[] = [];
    cols.push({
      id: 'label',
      header: () => <span>{firstColumnLabel}</span>,
      cell: ({ row }) => <div className="font-medium">{row.original.label}</div>,
    });
    for (const date of days) {
      cols.push({
        id: date,
        header: () => <span className="text-xs font-medium">{formatDay(date)}</span>,
        cell: ({ row }) => (
          <div className="text-center text-xs min-w-[60px]">
            {row.original.cells[date] ?? ''}
          </div>
        ),
      });
    }
    return cols;
  }, [days, firstColumnLabel]);

  return (
    <div className="mt-4">
      {error ? (
        <div className="text-red-600">
          Erro ao carregar: {String((error as any)?.message || error)}
        </div>
      ) : null}
      {loading ? (
        <div className="flex items-center justify-center p-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : (
        <DataTable columns={columns} data={rows} />
      )}
    </div>
  );
};
