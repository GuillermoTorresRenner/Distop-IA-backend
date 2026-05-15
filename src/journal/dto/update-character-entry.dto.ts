import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class UpdateCharacterJournalEntryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(180)
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(20000)
  body?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  sessionDate?: string;

  @ApiPropertyOptional({
    description:
      'Reasignar la nota a otro personaje del autor en la misma crónica.',
  })
  @IsOptional()
  @IsUUID()
  characterId?: string;
}
