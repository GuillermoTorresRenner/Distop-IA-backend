import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CharacterWeaponDto {
  @ApiProperty({ description: 'Weapon id (catalog or custom)' })
  @IsString()
  @IsNotEmpty()
  weaponId!: string;

  @ApiPropertyOptional({ description: 'Notas del personaje sobre esta arma' })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  notes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}
