import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateCharacterJournalEntryDto {
  @ApiProperty({ example: 'Memorias del 10 de mayo' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(180)
  title: string;

  @ApiProperty({ example: 'Esta noche tuve que esconderme...' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20000)
  body: string;

  @ApiPropertyOptional({ example: '2026-05-10T22:00:00Z' })
  @IsOptional()
  @IsDateString()
  sessionDate?: string;
}
