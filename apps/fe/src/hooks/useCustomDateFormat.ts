import { useCallback } from 'react';
import { DateHeaderFormat } from '../lib';

const pad = (n: number) => String(n).padStart(2, '0');
export const useCustomDateFormat = (dateHeaderFormat: DateHeaderFormat) => {
  return useCallback(
    (day: Date): string => {
      switch (dateHeaderFormat) {
        case 'iso':
          return day.toISOString().slice(0, 10);
        case 'dd/MM':
          return `${pad(day.getDate())}/${pad(day.getMonth() + 1)}`;
        case 'EEE dd/MM':
          return `${day.toLocaleDateString(undefined, {
            weekday: 'short',
          })} ${pad(day.getDate())}/${pad(day.getMonth() + 1)}`;
        case 'MMM dd':
          return `${day.toLocaleDateString(undefined, {
            month: 'short',
          })} ${pad(day.getDate())}`;
        case 'EEE MMM dd':
          return `${day.toLocaleDateString(undefined, {
            month: 'short',
          })} ${pad(day.getDate())} - ${day.toLocaleDateString(undefined, {
            weekday: 'short',
          })}`;
        case 'yyyy':
          return String(day.getFullYear());
        case 'locale':
        default:
          return day.toLocaleDateString();
      }
    },
    [dateHeaderFormat]
  );
};
