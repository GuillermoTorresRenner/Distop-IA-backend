import { Injectable, Logger } from '@nestjs/common';
import { join } from 'path';
import { ensureDir } from 'fs-extra';
import sharp from 'sharp';

export interface UploadResult {
  filename: string;
  path: string;
  size: number;
  mimetype: string;
}

@Injectable()
export class UploaderService {
  async uploadUserAvatar(
    file: Express.Multer.File,
    userId: string,
  ): Promise<UploadResult> {
    const uploadDir = join(
      process.cwd(),
      'public',
      'images',
      'users',
      'avatars',
    );
    await ensureDir(uploadDir);

    const timestamp = Date.now();
    const filename = `${userId}-${timestamp}.webp`;
    const filePath = join(uploadDir, filename);

    await sharp(file.buffer).webp({ quality: 80 }).toFile(filePath);

    return {
      filename,
      path: filePath,
      size: file.size,
      mimetype: 'image/webp',
    };
  }

  async deleteFile(filePath: string): Promise<void> {
    try {
      const fs = await import('fs-extra');
      await fs.remove(filePath);
    } catch (error) {
      const logger = new Logger(UploaderService.name);
      logger.error(`Error eliminando archivo ${filePath}:`, error);
    }
  }

  async deleteUserAvatar(filename: string): Promise<void> {
    if (!filename) return;

    const filePath = join(
      process.cwd(),
      'public',
      'images',
      'users',
      'avatars',
      filename,
    );
    await this.deleteFile(filePath);
  }

  async uploadChronicleImage(
    file: Express.Multer.File,
    chronicleId: string,
  ): Promise<UploadResult> {
    const uploadDir = join(
      process.cwd(),
      'public',
      'images',
      'chronicles',
    );
    await ensureDir(uploadDir);

    const timestamp = Date.now();
    const filename = `${chronicleId}-${timestamp}.webp`;
    const filePath = join(uploadDir, filename);

    await sharp(file.buffer)
      .resize({
        width: 1600,
        height: 900,
        fit: 'cover',
        withoutEnlargement: true,
      })
      .webp({ quality: 82 })
      .toFile(filePath);

    return {
      filename,
      path: filePath,
      size: file.size,
      mimetype: 'image/webp',
    };
  }

  async deleteChronicleImage(filename: string): Promise<void> {
    if (!filename) return;

    const filePath = join(
      process.cwd(),
      'public',
      'images',
      'chronicles',
      filename,
    );
    await this.deleteFile(filePath);
  }

  /**
   * Sube un binario (que llega como dataURL base64 desde Excalidraw) y lo
   * persiste como WebP en /app/public/images/boards/<chronicleId>/.
   *
   * Devuelve la URL relativa para servir la imagen via NPM.
   */
  async uploadBoardImage(
    dataURL: string,
    chronicleId: string,
  ): Promise<UploadResult> {
    const parsed = parseDataUrl(dataURL);
    if (!parsed) {
      throw new Error('Invalid dataURL');
    }
    const uploadDir = join(
      process.cwd(),
      'public',
      'images',
      'boards',
      chronicleId,
    );
    await ensureDir(uploadDir);

    const timestamp = Date.now();
    const random = Math.random().toString(36).slice(2, 8);
    const filename = `${timestamp}-${random}.webp`;
    const filePath = join(uploadDir, filename);

    // Convertimos cualquier formato de entrada a webp con calidad razonable.
    // Limit resize en alto/ancho para evitar imágenes gigantes pegadas desde
    // el portapapeles.
    await sharp(parsed.buffer)
      .resize({
        width: 2048,
        height: 2048,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: 82 })
      .toFile(filePath);

    return {
      filename,
      path: filePath,
      size: parsed.buffer.length,
      mimetype: 'image/webp',
    };
  }
}

/**
 * Parsea un dataURL `data:image/png;base64,iVBOR...` a buffer + mime.
 */
function parseDataUrl(dataURL: string):
  | { buffer: Buffer; mime: string }
  | null {
  const m = /^data:([^;]+);base64,(.+)$/i.exec(dataURL ?? '');
  if (!m) return null;
  try {
    return { mime: m[1], buffer: Buffer.from(m[2], 'base64') };
  } catch {
    return null;
  }
}
