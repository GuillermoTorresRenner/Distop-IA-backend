import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateArmorDto {
  @ApiProperty({ example: 'Armadura ritual de la Camarilla' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name!: string;

  @ApiProperty({ description: 'Puntuación de absorción (manual: clase 1..5).' })
  @IsInt()
  @Min(0)
  @Max(10)
  rating!: number;

  @ApiProperty({ description: 'Penalización a reservas de Destreza.' })
  @IsInt()
  @Min(0)
  @Max(10)
  penalty!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}

export class UpdateArmorDto extends PartialType(CreateArmorDto) {}
