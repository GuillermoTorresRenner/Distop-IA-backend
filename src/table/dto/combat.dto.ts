import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
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

/**
 * Clona N copias ("mooks") de un Character NPC/ANTAGONIST asociado a la mesa.
 * Genera entradas en el tracker con stats embebidos (Destreza, Astucia, salud)
 * sin crear Characters nuevos. Solo narrador.
 */
export class CloneAntagonistDto {
  @ApiProperty({ description: 'ID del Character plantilla (NPC o ANTAGONIST).' })
  @IsString()
  sourceCharacterId!: string;

  @ApiProperty({ description: 'Número de copias a generar (1..20).' })
  @IsInt()
  @Min(1)
  @Max(20)
  count!: number;

  @ApiPropertyOptional({
    description:
      'Nombre base para las copias. Se sufija con " 1", " 2", … Si no se provee, usa el nombre de la plantilla.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  baseName?: string;
}

/**
 * Actualiza las casillas de salud de un mook (participant sin Character con
 * stats embebidos). Cada nivel V20 tiene su casilla — los bruised/hurt/incap
 * son 1, los demás son 2.
 */
export class UpdateParticipantHealthDto {
  @ApiPropertyOptional({ description: 'Magullado (0..1).' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1)
  bruised?: number;

  @ApiPropertyOptional({ description: 'Herido (0..1).' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1)
  hurt?: number;

  @ApiPropertyOptional({ description: 'Lesionado (0..2).' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(2)
  injured?: number;

  @ApiPropertyOptional({ description: 'Herida (0..2).' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(2)
  wounded?: number;

  @ApiPropertyOptional({ description: 'Destrozado (0..2).' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(2)
  mauled?: number;

  @ApiPropertyOptional({ description: 'Inmovilizado (0..2).' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(2)
  crippled?: number;

  @ApiPropertyOptional({ description: 'Incapacitado (0..1).' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1)
  incapacitated?: number;
}
