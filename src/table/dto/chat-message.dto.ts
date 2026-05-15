import { Type } from 'class-transformer';
import {
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';

export enum ChatRecipientKind {
  ALL = 'all',
  NARRATOR = 'narrator',
  USER = 'user',
}

export class ChatRecipientDto {
  @IsEnum(ChatRecipientKind)
  kind!: ChatRecipientKind;

  /** Requerido si kind === 'user'. */
  @IsOptional()
  @IsUUID()
  userId?: string;
}

export enum ChatSpeakerKind {
  SELF = 'self',
  CHARACTER = 'character',
}

export class ChatSpeakerDto {
  @IsEnum(ChatSpeakerKind)
  kind!: ChatSpeakerKind;

  /** Requerido si kind === 'character'. */
  @IsOptional()
  @IsUUID()
  characterId?: string;
}

export class ChatMessageDto {
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  text!: string;

  /**
   * Destinatario del mensaje:
   *  - undefined o {kind: 'all'} → toda la sala (default).
   *  - {kind: 'narrator'} → solo autor + narrador.
   *  - {kind: 'user', userId} → solo autor + ese usuario (susurro).
   */
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ChatRecipientDto)
  recipient?: ChatRecipientDto;

  /**
   * Identidad con la que habla el autor:
   *  - undefined o {kind: 'self'} → habla como usuario (nickname).
   *  - {kind: 'character', characterId} → habla como ese PJ (debe ser suyo
   *    y estar asociado a la crónica; el narrador puede usar cualquier PJ
   *    suyo de la crónica, incluyendo PNJs/Antagonistas).
   */
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ChatSpeakerDto)
  as?: ChatSpeakerDto;
}
