import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator';

export class SendMessageDto {
  @ApiProperty({ description: 'User id of the recipient (must be a friend).' })
  @IsUUID()
  @IsNotEmpty()
  recipientId!: string;

  @ApiProperty({ description: 'Markdown body (max 8000 chars).' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(8000)
  body!: string;
}
