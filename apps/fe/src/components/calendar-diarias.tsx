import React, { useMemo } from 'react';
import { IDiariaFuncionarioDto } from '@dougust/types';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@dougust/ui';

export type CalendarDiariasProps = {
  funcionarios: IDiariaFuncionarioDto[];
  start: string | Date;
  end: string | Date;
  loading?: boolean;
  error?: unknown;
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
  funcionarios,
  start,
  end,
  loading,
  error,
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

  return (
    <div className="mt-4">
      {error ? (
        <div className="text-red-600">
          Erro ao carregar: {String((error as any)?.message || error)}
        </div>
      ) : null}
      <Table className="min-w-max border-collapse">
        <TableHeader>
          <TableRow>
            <TableHead className="sticky left-0 z-10 bg-white border px-2 py-1 text-left">
              Funcionário
            </TableHead>
            {days.map((date) => (
              <TableHead
                key={date}
                className="border px-2 py-1 text-xs font-medium whitespace-nowrap"
              >
                {formatDay(date)}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell className="border px-2 py-2" colSpan={1 + days.length}>
                Carregando...
              </TableCell>
            </TableRow>
          ) : funcionarios.length === 0 ? (
            <TableRow>
              <TableCell className="border px-2 py-2" colSpan={1 + days.length}>
                Nenhum registro encontrado.
              </TableCell>
            </TableRow>
          ) : (
            funcionarios.map((f) => {
              const byDate = new Map<string, string | undefined>();
              for (const d of f.diarias || []) {
                const key = typeof d.dia === 'string'
                  ? d.dia
                  : new Date(d.dia as any).toISOString().slice(0, 10);
                byDate.set(key, (d as any).tipo);
              }
              return (
                <TableRow key={f.id}>
                  <TableCell className="sticky left-0 z-10 bg-white border px-2 py-1 font-medium whitespace-nowrap">
                    {f.nome || f.social || f.email}
                  </TableCell>
                  {days.map((date) => (
                    <TableCell
                      key={date}
                      className="border px-2 py-1 text-center text-xs align-middle min-w-[60px]"
                    >
                      {byDate.get(date) || ''}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
};
