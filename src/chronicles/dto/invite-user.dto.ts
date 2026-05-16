import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsUUID, ValidateIf } from 'class-validator';

export class InviteUserDto {
  @ApiPropertyOptional({
    description:
      'Email of the player to invite. Required when userId is not provided.',
    example: 'jugador@dominio.com',
  })
  @ValidateIf((o: InviteUserDto) => !o.userId)
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    description:
      'Id of an already registered user to invite. Takes precedence over email when provided.',
  })
  @IsOptional()
  @IsUUID()
  userId?: string;
}
