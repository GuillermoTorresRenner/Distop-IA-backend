import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateChronicleJournalEntryDto {
  @ApiProperty({ example: 'Sesión 3 — La caída del Príncipe' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(180)
  title: string;

  @ApiProperty({ example: 'Esta noche el coterie...' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20000)
  body: string;

  @ApiPropertyOptional({ example: '2026-05-10T22:00:00Z' })
  @IsOptional()
  @IsDateString()
  sessionDate?: string;
}
