import { IsBoolean } from 'class-validator';

export class ShareCharacterEntryDto {
  @IsBoolean()
  isShared: boolean;
}
