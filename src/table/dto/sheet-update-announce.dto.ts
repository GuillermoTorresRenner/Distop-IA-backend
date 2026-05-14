import {
  ArrayMaxSize,
  IsArray,
  IsString,
  IsUUID,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class SheetDeltaEntryDto {
  /** Etiqueta legible: "Sangre", "Voluntad actual", "Magullado". */
  @IsString()
  @MaxLength(60)
  label!: string;

  /** Antes y después como strings cortos (ya formateados). Ej "7", "/", "✕". */
  @IsString()
  @MaxLength(20)
  before!: string;

  @IsString()
  @MaxLength(20)
  after!: string;
}

export class SheetUpdateAnnounceDto {
  @IsUUID()
  characterId!: string;

  @IsArray()
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => SheetDeltaEntryDto)
  deltas!: SheetDeltaEntryDto[];
}
