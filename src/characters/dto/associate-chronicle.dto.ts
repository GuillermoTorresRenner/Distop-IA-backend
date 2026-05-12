import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class AssociateChronicleDto {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  chronicleId!: string;
}
