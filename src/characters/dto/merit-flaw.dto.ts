import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

/**
 * Mérito o Defecto del personaje. Dos modos mutuamente excluyentes:
 *  - **Catálogo:** `meritFlawId` set, los campos `customX` van vacíos.
 *  - **Custom:** `meritFlawId` ausente, `customName/Kind/Value` obligatorios.
 *
 * El service valida que exactamente uno de los modos esté presente; si
 * llegan los dos o ninguno, devuelve 400.
 */
export class CharacterMeritFlawDto {
  @ApiPropertyOptional({ description: 'MeritFlaw catalog id' })
  @IsOptional()
  @IsString()
  meritFlawId?: string;

  @ApiPropertyOptional({ description: 'Nombre del mérito/defecto customizado.' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  customName?: string;

  @ApiPropertyOptional({ enum: ['MERIT', 'FLAW'] })
  @IsOptional()
  @IsEnum(['MERIT', 'FLAW'] as const)
  customKind?: 'MERIT' | 'FLAW';

  @ApiPropertyOptional({ description: 'Coste: positivo (mérito) o negativo (defecto).' })
  @IsOptional()
  @IsInt()
  @Min(-7)
  @Max(7)
  customValue?: number;

  @ApiPropertyOptional({ description: 'Categoría libre (Físico, Mental, Social, Sobrenatural).' })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  customCategory?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
