import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class RollVtmDto {
  @IsInt()
  @Min(1)
  @Max(30)
  pool!: number;

  @IsInt()
  @Min(2)
  @Max(10)
  @IsOptional()
  difficulty?: number;

  @IsBoolean()
  @IsOptional()
  specialty?: boolean;

  /**
   * Nivel de la habilidad declarada (1..5). Necesario si specialty=true para
   * validar la regla V20 que exige habilidad >= 4 para declarar especialidad.
   */
  @IsInt()
  @Min(0)
  @Max(5)
  @IsOptional()
  skillRating?: number;

  /**
   * Texto (markdown) de la especialidad declarada en la habilidad. Se
   * persiste con la tirada como snapshot histórico para mostrarlo en
   * hover desde el chat. Sólo aplica cuando specialty=true.
   */
  @IsString()
  @IsOptional()
  @MaxLength(2000)
  specialtyText?: string;

  /**
   * Gasta 1 punto de Voluntad para sumar 1 éxito automático no removible
   * por 1s. El éxito se aplica al final, después del cálculo normal.
   */
  @IsBoolean()
  @IsOptional()
  willpowerForSuccess?: boolean;

  /**
   * Gasta 1 punto de Voluntad para anular el penalizador por heridas en
   * esta tirada (el pool no se ve reducido por daño).
   */
  @IsBoolean()
  @IsOptional()
  willpowerForWound?: boolean;

  /**
   * Gasta 1 punto de Voluntad para relanzar todos los dados que no fueron
   * éxito (una sola vez). Los 1s del reroll también restan.
   */
  @IsBoolean()
  @IsOptional()
  willpowerForReroll?: boolean;

  /**
   * Penalizador por heridas que el cliente calculó a partir del estado actual
   * del personaje. Es un valor negativo o 0 (ej -1, -2, -5). El back lo persiste
   * para reproducir el desglose en el historial.
   */
  @IsInt()
  @Min(-10)
  @Max(0)
  @IsOptional()
  woundPenalty?: number;

  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;

  @IsString()
  @IsOptional()
  @MaxLength(120)
  label?: string;

  /** Origen de la tirada. Hoy se usa "DISCIPLINE"; null = tirada normal. */
  @IsString()
  @IsOptional()
  @MaxLength(32)
  sourceKind?: string;

  /** Etiqueta legible asociada al origen (ej. nombre de la disciplina). */
  @IsString()
  @IsOptional()
  @MaxLength(64)
  sourceName?: string;

  @IsUUID()
  @IsOptional()
  characterId?: string;
}
