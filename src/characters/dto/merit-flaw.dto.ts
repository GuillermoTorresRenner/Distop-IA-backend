import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CharacterMeritFlawDto {
  @ApiProperty({ description: 'MeritFlaw catalog id' })
  @IsString()
  @IsNotEmpty()
  meritFlawId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
