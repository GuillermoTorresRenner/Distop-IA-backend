import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const EMPTY_ELEMENTS = [] as unknown as Prisma.InputJsonValue;

@Injectable()
export class BoardService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Devuelve la pizarra de la crónica. Si no existe la crea vacía.
   * Solo miembros pueden leerla.
   */
  async getBoardForMember(chronicleId: string, callerId: string) {
    await this.assertMember(chronicleId, callerId);
    const board = await this.prisma.chronicleBoard.findUnique({
      where: { chronicleId },
    });
    if (board) return board;
    return this.prisma.chronicleBoard.create({
      data: {
        chronicleId,
        elements: EMPTY_ELEMENTS,
        appState: Prisma.JsonNull,
        isShared: false,
      },
    });
  }

  /**
   * Reemplaza el snapshot. Solo el narrador puede escribir.
   */
  async saveBoardAsNarrator(
    chronicleId: string,
    callerId: string,
    elements: unknown[],
    appState: Record<string, unknown> | null,
  ) {
    await this.assertNarrator(chronicleId, callerId);
    const elementsJson = elements as unknown as Prisma.InputJsonValue;
    const appStateJson =
      appState === null
        ? Prisma.JsonNull
        : (appState as Prisma.InputJsonValue);
    // Upsert para que la primera escritura cree la fila si no existe.
    return this.prisma.chronicleBoard.upsert({
      where: { chronicleId },
      create: {
        chronicleId,
        elements: elementsJson,
        appState: appStateJson,
        isShared: false,
      },
      update: {
        elements: elementsJson,
        appState: appStateJson,
      },
    });
  }

  /**
   * Registra una referencia a un archivo binario subido al disco.
   * Solo el narrador puede agregar files (es quien edita la pizarra).
   */
  async addFileRef(
    chronicleId: string,
    callerId: string,
    fileId: string,
    url: string,
    mimeType: string,
  ): Promise<{ fileId: string; url: string; mimeType: string }> {
    await this.assertNarrator(chronicleId, callerId);
    // Read-modify-write del JSON de fileRefs.
    const board = await this.getBoardForMember(chronicleId, callerId);
    const current = (board.fileRefs ?? {}) as Record<
      string,
      { url: string; mimeType: string }
    >;
    const next: Record<string, { url: string; mimeType: string }> = {
      ...current,
      [fileId]: { url, mimeType },
    };
    await this.prisma.chronicleBoard.update({
      where: { chronicleId },
      data: { fileRefs: next as unknown as Prisma.InputJsonValue },
    });
    return { fileId, url, mimeType };
  }

  /**
   * Marca la pizarra como compartida (read-only para jugadores) o privada.
   * Solo el narrador puede cambiar este flag.
   */
  async setShared(chronicleId: string, callerId: string, isShared: boolean) {
    await this.assertNarrator(chronicleId, callerId);
    return this.prisma.chronicleBoard.upsert({
      where: { chronicleId },
      create: {
        chronicleId,
        elements: EMPTY_ELEMENTS,
        appState: Prisma.JsonNull,
        isShared,
      },
      update: { isShared },
    });
  }

  // ──────────────────────────────────────────────
  // Helpers de permisos
  // ──────────────────────────────────────────────

  private async assertMember(chronicleId: string, userId: string) {
    const member = await this.prisma.chronicleMember.findUnique({
      where: { chronicleId_userId: { chronicleId, userId } },
      select: { id: true },
    });
    if (!member) {
      throw new ForbiddenException('You are not a member of this chronicle');
    }
  }

  private async assertNarrator(chronicleId: string, userId: string) {
    const chronicle = await this.prisma.chronicle.findUnique({
      where: { id: chronicleId },
      select: { narratorId: true },
    });
    if (!chronicle) throw new NotFoundException('Chronicle not found');
    if (chronicle.narratorId !== userId) {
      throw new ForbiddenException('Only the narrator can do this');
    }
  }
}
