import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class AddCombatParticipantDto {
  @ApiPropertyOptional({
    description:
      'ID de un Character asociado a la crónica. Si no se provee, se requiere displayName (entrada libre).',
  })
  @IsOptional()
  @IsString()
  characterId?: string;

  @ApiPropertyOptional({
    description:
      'Nombre visible. Obligatorio si no hay characterId. Si hay characterId, sirve como override opcional.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  displayName?: string;

  @ApiPropertyOptional({
    description: 'Valor de iniciativa anotado por el master.',
  })
  @IsOptional()
  @IsInt()
  initiative?: number;
}

export class UpdateCombatParticipantDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  initiative?: number | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(120)
  displayName?: string | null;
}

export class ReorderCombatDto {
  @ApiProperty({
    description: 'IDs de los participantes en el orden deseado (top → bottom).',
    type: [String],
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  orderedIds!: string[];
}
