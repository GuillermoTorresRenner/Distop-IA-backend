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

  @IsUUID()
  @IsOptional()
  characterId?: string;
}
