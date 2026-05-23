import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import {
  NICKNAME_REGEX,
  NICKNAME_REGEX_MESSAGE,
} from '../../common/validation/nickname';

export class CreateUserDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({
    example: 'vlad_dracul',
    description: '3-30 chars, [a-zA-Z0-9_-]',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(NICKNAME_REGEX, { message: NICKNAME_REGEX_MESSAGE })
  nickname!: string;

  @ApiProperty({ example: 'Password123', minLength: 6 })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password!: string;
}
