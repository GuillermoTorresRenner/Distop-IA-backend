import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, Max, Min } from 'class-validator';

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
}
