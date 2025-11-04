import { IsDateString } from 'class-validator';

export class RangeQueryDto {
  @IsDateString()
  from: string;

  @IsDateString()
  to: string;
}
