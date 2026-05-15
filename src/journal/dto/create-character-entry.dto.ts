import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
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

  @ApiProperty({
    example: 'b94f9c4b-9c84-4a1f-9a8d-1f3e0a2bafe0',
    description:
      'Personaje al que pertenece la nota. Debe pertenecer al autor y estar asociado a la crónica.',
  })
  @IsUUID()
  characterId: string;
}
