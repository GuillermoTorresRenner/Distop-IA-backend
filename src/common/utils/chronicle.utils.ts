/**
 * Devuelve una URL RELATIVA al dominio público (sin host) que sirve la imagen
 * de portada de la crónica.
 *
 * Diseño: el back no se expone a internet en QA/prod, así que jamás devolvemos
 * un host absoluto. El browser resuelve la URL contra el dominio del front
 * (distopia-qa.guillermotorresdev.com) y nginx-proxy-manager tiene una Custom
 * Location `/images` que rutea al backend por la red interna Docker.
 *
 * En dev local (`npm run start:dev`) el front pega directamente al back en
 * localhost:3000, y como el axios usa `VITE_API_URL=http://localhost:3000/api`,
 * las URLs relativas se resuelven contra el origen del front (localhost:5173),
 * que NO sirve `/images`. Para mantener compatibilidad en dev, ver
 * `back/CLAUDE.md` — el simplemente acceder a `http://localhost:3000/images/...`
 * directo sigue funcionando.
 */
export function buildChronicleImageUrl(filename: string): string | null {
  if (!filename) return null;
  return `/images/chronicles/${filename}`;
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
