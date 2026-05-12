import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { AbilityCategory } from '@prisma/client';

export class CharacterAbilityDto {
  @ApiProperty({ enum: AbilityCategory })
  @IsEnum(AbilityCategory)
  category!: AbilityCategory;

  @ApiProperty({ example: 'Alerta' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  name!: string;

  @ApiProperty({ minimum: 0, maximum: 5, default: 0 })
  @IsInt()
  @Min(0)
  @Max(5)
  value!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(120)
  specialty?: string;
}
