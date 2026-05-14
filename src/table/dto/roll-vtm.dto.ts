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

export class RollVtmDto {
  @IsInt()
  @Min(1)
  @Max(30)
  pool!: number;

  @IsInt()
  @Min(2)
  @Max(10)
  @IsOptional()
  difficulty?: number;

  @IsBoolean()
  @IsOptional()
  specialty?: boolean;

  @IsBoolean()
  @IsOptional()
  willpowerSpent?: boolean;

  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;

  @IsString()
  @IsOptional()
  @MaxLength(120)
  label?: string;

  @IsUUID()
  @IsOptional()
  characterId?: string;
}
