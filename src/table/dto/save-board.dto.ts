import { IsArray, IsObject, IsOptional } from 'class-validator';

/**
 * Snapshot persistible de la pizarra del narrador.
 * `elements` es el array que devuelve Excalidraw en su API.
 * `appState` se guarda parcial (solo lo serializable, ver back/whiteboard.service.ts).
 */
export class SaveBoardDto {
  @IsArray()
  elements!: unknown[];

  @IsOptional()
  @IsObject()
  appState?: Record<string, unknown>;
}
