import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class InviteUserDto {
  @ApiProperty({ example: 'jugador@dominio.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
