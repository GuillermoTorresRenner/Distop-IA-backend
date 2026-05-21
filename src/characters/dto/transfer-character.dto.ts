import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class TransferCharacterDto {
  @ApiProperty({
    description:
      'User id that will become the new owner of the character. Must be a member of the chronicle.',
  })
  @IsUUID()
  @IsNotEmpty()
  targetUserId!: string;
}
