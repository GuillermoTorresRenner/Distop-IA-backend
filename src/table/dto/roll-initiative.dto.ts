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

/**
 * Tirada de iniciativa V20: 1d10 + Destreza + Astucia del personaje.
 * No tiene pool, dificultad ni voluntad; el back lee los atributos del
 * personaje y devuelve el resultado junto con la actualización del tracker
 * de turnos.
 */
export class RollInitiativeDto {
  /** Personaje que tira la iniciativa. Debe estar asociado a la crónica. */
  @IsUUID()
  characterId!: string;

  /** Etiqueta opcional (ej. "Asalto sorpresa"). */
  @IsString()
  @IsOptional()
  @MaxLength(120)
  label?: string;

  /** Visibilidad. Default true. */
  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;

  /**
   * Modificador circunstancial entero, positivo o negativo (ej. -2 por
   * estar sorprendido, +1 por celeridad, etc.). Se suma al total junto
   * con Destreza y Astucia. Rango razonable [-20, +20] para evitar abusos.
   */
  @IsInt()
  @Min(-20)
  @Max(20)
  @IsOptional()
  modifier?: number;
}
