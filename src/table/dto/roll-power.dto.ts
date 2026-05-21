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
 * Tirada de un poder de disciplina o ritual con su pool canon
 * (atributo + habilidad) y la dificultad declarada en el catálogo. El
 * gateway valida que el personaje conoce el poder/ritual al nivel
 * requerido, calcula el pool desde sus stats, y delega en
 * `DiceService.rollPower`.
 *
 * Exactamente uno de `powerId` o `ritualId` debe estar presente.
 */
export class RollPowerDto {
  /** Personaje que ejecuta el poder. Debe estar asociado a la crónica. */
  @IsUUID()
  characterId!: string;

  /** Id del DisciplinePower a lanzar. Mutuamente excluyente con ritualId. */
  @IsUUID()
  @IsOptional()
  powerId?: string;

  /** Id del DisciplineRitual a lanzar. Mutuamente excluyente con powerId. */
  @IsUUID()
  @IsOptional()
  ritualId?: string;

  /** Etiqueta opcional (ej. "Castigar a Marcus"). */
  @IsString()
  @IsOptional()
  @MaxLength(160)
  label?: string;

  /**
   * Modificador circunstancial entero. Se suma al pool (no a la
   * dificultad) para que la tirada respete la dificultad del catálogo.
   * Rango [-10, +10].
   */
  @IsInt()
  @Min(-10)
  @Max(10)
  @IsOptional()
  modifier?: number;

  /** Visibilidad. Default true; para tiradas privadas pasar false. */
  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;
}
