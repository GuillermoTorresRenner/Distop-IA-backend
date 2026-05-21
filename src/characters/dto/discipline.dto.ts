import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

/// Nivel en una senda específica (Taumaturgia, Nigromancia). El service
/// valida que: a) la senda pertenece a la disciplina, b) `isPrimary`
/// está marcada en exactamente una senda por disciplina, y c) ninguna
/// secundaria supera a la primaria.
export class CharacterDisciplinePathDto {
  @ApiProperty({ description: 'DisciplinePath id (catalog)' })
  @IsString()
  @IsNotEmpty()
  pathId!: string;

  @ApiProperty({ minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  level!: number;

  @ApiPropertyOptional({
    description: 'Marca esta senda como primaria. Default false.',
  })
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}

export class CharacterDisciplineDto {
  @ApiProperty({ description: 'Discipline catalog id' })
  @IsString()
  @IsNotEmpty()
  disciplineId!: string;

  @ApiProperty({ minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  level!: number;

  /// Para disciplinas con `hasPaths=true` (Taumaturgia, Nigromancia) el
  /// cliente debe mandar las sendas conocidas. Cada senda con su nivel y
  /// la marca de primaria. Si la disciplina es monolítica este campo
  /// debe estar vacío o no presente; el service lo valida.
  @ApiPropertyOptional({ type: [CharacterDisciplinePathDto] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(8)
  @ValidateNested({ each: true })
  @Type(() => CharacterDisciplinePathDto)
  paths?: CharacterDisciplinePathDto[];

  /// Rituales aprendidos por el personaje (solo aplicable a disciplinas
  /// con sendas). Lista de ids de DisciplineRitual del catálogo.
  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(50)
  @IsUUID('all', { each: true })
  learnedRitualIds?: string[];
}
