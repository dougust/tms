export type DateHeaderFormat =
  | 'locale'
  | 'iso'
  | 'dd/MM'
  | 'EEE dd/MM'
  | 'MMM dd'
  | 'EEE MMM dd'
  | 'yyyy';

export const dateFormatOptions: { label: string; value: DateHeaderFormat }[] = [
  { label: 'Locale default', value: 'locale' },
  { label: 'ISO (YYYY-MM-DD)', value: 'iso' },
  { label: 'dd/MM', value: 'dd/MM' },
  { label: 'EEE dd/MM', value: 'EEE dd/MM' },
  { label: 'MMM dd', value: 'MMM dd' },
  { label: 'EEE MMM dd', value: 'EEE MMM dd' },
  { label: 'yyyy', value: 'yyyy' },
];
