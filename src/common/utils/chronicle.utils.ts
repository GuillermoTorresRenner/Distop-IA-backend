import { envs } from '../../config/envs';

export function buildChronicleImageUrl(filename: string): string | null {
  if (!filename) return null;
  return `${envs.backendUrl}/images/chronicles/${filename}`;
}

export function enrichChronicleWithImageUrl<
  T extends { image?: string | null },
>(chronicle: T): T & { image: string | null } {
  if (!chronicle) return chronicle as T & { image: string | null };
  return {
    ...chronicle,
    image: chronicle.image ? buildChronicleImageUrl(chronicle.image) : null,
  };
}

export function enrichChroniclesWithImageUrls<
  T extends { image?: string | null },
>(chronicles: T[]): Array<T & { image: string | null }> {
  return chronicles.map((c) => enrichChronicleWithImageUrl(c));
}
