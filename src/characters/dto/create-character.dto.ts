import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { VirtueScheme } from '@prisma/client';
import { CharacterAbilityDto } from './ability.dto';
import { CharacterBackgroundDto } from './background.dto';
import { CharacterDisciplineDto } from './discipline.dto';
import { CharacterMeritFlawDto } from './merit-flaw.dto';

const ATTR_MIN = 1;
const ATTR_MAX = 5;

export class CreateCharacterDto {
  // Identidad
  @ApiProperty({ example: 'Lucius Carfax' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name!: string;

  @ApiPropertyOptional({ example: 'Inquisidor renegado' })
  @IsOptional() @IsString() @MaxLength(200)
  concept?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(120)
  chronicleName?: string;

  @ApiPropertyOptional({ minimum: 4, maximum: 15 })
  @IsOptional() @IsInt() @Min(4) @Max(15)
  generation?: number;

  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(200)
  haven?: string;

  @ApiPropertyOptional({ description: 'Clan catalog id' })
  @IsOptional() @IsString() clanId?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() natureId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() demeanorId?: string;

  // Atributos (1-5, default 1)
  @IsOptional() @IsInt() @Min(ATTR_MIN) @Max(ATTR_MAX) strength?: number;
  @IsOptional() @IsInt() @Min(ATTR_MIN) @Max(ATTR_MAX) dexterity?: number;
  @IsOptional() @IsInt() @Min(ATTR_MIN) @Max(ATTR_MAX) stamina?: number;
  @IsOptional() @IsInt() @Min(ATTR_MIN) @Max(ATTR_MAX) charisma?: number;
  @IsOptional() @IsInt() @Min(ATTR_MIN) @Max(ATTR_MAX) manipulation?: number;
  @IsOptional() @IsInt() @Min(ATTR_MIN) @Max(ATTR_MAX) appearance?: number;
  @IsOptional() @IsInt() @Min(ATTR_MIN) @Max(ATTR_MAX) perception?: number;
  @IsOptional() @IsInt() @Min(ATTR_MIN) @Max(ATTR_MAX) intelligence?: number;
  @IsOptional() @IsInt() @Min(ATTR_MIN) @Max(ATTR_MAX) wits?: number;

  // Virtudes
  @ApiPropertyOptional({ enum: VirtueScheme })
  @IsOptional() @IsEnum(VirtueScheme) virtueScheme?: VirtueScheme;
  @IsOptional() @IsInt() @Min(1) @Max(5) conscience?: number;
  @IsOptional() @IsInt() @Min(1) @Max(5) selfControl?: number;
  @IsOptional() @IsInt() @Min(1) @Max(5) courage?: number;

  // Estado
  @IsOptional() @IsInt() @Min(0) @Max(10) humanity?: number;
  @IsOptional() @IsInt() @Min(0) @Max(10) willpowerMax?: number;
  @IsOptional() @IsInt() @Min(0) @Max(10) willpowerCurrent?: number;
  @IsOptional() @IsInt() @Min(0) @Max(20) bloodPool?: number;

  // Salud: 0 = ileso, 1 = contundente (/), 2 = letal/agravado (X)
  @IsOptional() @IsInt() @Min(0) @Max(2) healthBruised?: number;
  @IsOptional() @IsInt() @Min(0) @Max(2) healthHurt?: number;
  @IsOptional() @IsInt() @Min(0) @Max(2) healthInjured?: number;
  @IsOptional() @IsInt() @Min(0) @Max(2) healthWounded?: number;
  @IsOptional() @IsInt() @Min(0) @Max(2) healthMauled?: number;
  @IsOptional() @IsInt() @Min(0) @Max(2) healthCrippled?: number;
  @IsOptional() @IsInt() @Min(0) @Max(2) healthIncapacitated?: number;

  @IsOptional() @IsInt() @Min(0) experience?: number;

  // Listas
  @ApiPropertyOptional({ type: [CharacterAbilityDto] })
  @IsOptional() @IsArray() @ArrayMaxSize(60)
  @ValidateNested({ each: true }) @Type(() => CharacterAbilityDto)
  abilities?: CharacterAbilityDto[];

  @ApiPropertyOptional({ type: [CharacterBackgroundDto] })
  @IsOptional() @IsArray() @ArrayMaxSize(10)
  @ValidateNested({ each: true }) @Type(() => CharacterBackgroundDto)
  backgrounds?: CharacterBackgroundDto[];

  @ApiPropertyOptional({ type: [CharacterDisciplineDto] })
  @IsOptional() @IsArray() @ArrayMaxSize(15)
  @ValidateNested({ each: true }) @Type(() => CharacterDisciplineDto)
  disciplines?: CharacterDisciplineDto[];

  @ApiPropertyOptional({ type: [CharacterMeritFlawDto] })
  @IsOptional() @IsArray() @ArrayMaxSize(20)
  @ValidateNested({ each: true }) @Type(() => CharacterMeritFlawDto)
  meritsFlaws?: CharacterMeritFlawDto[];
}
