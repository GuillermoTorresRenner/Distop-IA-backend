import { IsString, Matches, MaxLength, MinLength } from 'class-validator';

// 2MB en base64 ≈ 2_900_000 chars. Damos un margen y rechazamos arriba de 3MB.
const MAX_DATAURL_CHARS = 3_000_000;

export class UploadBoardFileDto {
  /**
   * Identificador que Excalidraw genera para cada archivo. Lo respetamos
   * para que al rehidratar los elementos sigan apuntando al mismo id.
   */
  @IsString()
  @MinLength(1)
  @MaxLength(128)
  fileId!: string;

  /**
   * Contenido en formato `data:image/<png|jpeg|webp|gif>;base64,<...>`.
   * Limitado en tamaño para evitar pizarras gigantes.
   */
  @IsString()
  @Matches(/^data:image\/(png|jpeg|jpg|webp|gif);base64,/)
  @MaxLength(MAX_DATAURL_CHARS)
  dataURL!: string;
}
