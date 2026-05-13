import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';
import { CreateCharacterDto } from '../../characters/dto/create-character.dto';

/**
 * Crea un personaje y lo asocia a una crónica en una sola llamada.
 * Si se envía `targetUserId` el caller debe ser narrador de la crónica;
 * el personaje quedará bajo la propiedad de ese usuario (debe ser miembro).
 * Si se omite, el dueño es el caller (debe ser miembro).
 *
 * `kind` se hereda del DTO base:
 * - PC (default) — personaje del jugador.
 * - NPC / ANTAGONIST — solo el narrador puede crearlos; quedan bajo su propiedad.
 */
export class CreateChronicleCharacterDto extends CreateCharacterDto {
  @ApiPropertyOptional({
    description:
      'User id that will own the character. Only the narrator may set a value different from the caller.',
  })
  @IsOptional()
  @IsString()
  @IsUUID()
  targetUserId?: string;
}
