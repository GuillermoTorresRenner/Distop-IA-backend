import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateFriendshipDto {
  @ApiProperty({ description: 'User id of the addressee' })
  @IsUUID()
  @IsNotEmpty()
  addresseeId: string;
}
