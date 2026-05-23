import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { WeaponDamageBase, WeaponKind } from '@prisma/client';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateWeaponDto {
  @ApiProperty({ example: 'Bate de béisbol firmado' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name!: string;

  @ApiProperty({ enum: WeaponKind })
  @IsEnum(WeaponKind)
  kind!: WeaponKind;

  @ApiProperty({ description: 'WeaponCategory id' })
  @IsString()
  @IsNotEmpty()
  categoryId!: string;

  @ApiProperty({ enum: WeaponDamageBase })
  @IsEnum(WeaponDamageBase)
  damageBase!: WeaponDamageBase;

  @ApiProperty({
    example: 1,
    description: 'Bono al daño (Fuerza + bono o valor fijo).',
  })
  @IsInt()
  @Min(0)
  damageBonus!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  lethal?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  aggravated?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  bluntPlus?: boolean;

  // RANGED-only
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) range?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(16) rate?: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) magazine?: number;
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(8)
  concealment?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}

export class UpdateWeaponDto extends PartialType(CreateWeaponDto) {}
