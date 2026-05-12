import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateChronicleDto {
  @ApiProperty({ example: 'Noches de Chicago' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name: string;

  @ApiProperty({ required: false, example: 'Camarilla, ambientada en 1998.' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiProperty({ required: false, example: 'Chicago by Night' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  setting?: string;
}
