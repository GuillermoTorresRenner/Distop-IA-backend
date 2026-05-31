import { IsUrl, IsString } from 'class-validator';

export class PlayMusicDto {
  @IsString()
  @IsUrl()
  url: string; // URL de YouTube
}
