/**
 * URL pública del retrato de personaje (relativa al dominio del front).
 *
 * Misma estrategia que `chronicle.utils.ts`: jamás devolvemos host absoluto;
 * NPM tiene Custom Location `/images` que rutea al backend por red interna.
 */
export function buildCharacterAvatarUrl(filename: string): string | null {
  if (!filename) return null;
  return `/images/characters/avatars/${filename}`;
}

/**
 * Reemplaza el campo `avatar` (filename almacenado en BD) por una URL
 * relativa lista para consumir desde el frontend. Si no había avatar,
 * devuelve `null`.
 *
 * Funciona como mutación inmutable: retorna un objeto nuevo con la misma
 * forma del input, manteniendo todas las relaciones y campos auxiliares.
 */
export function enrichCharacterWithAvatarUrl<
  T extends { avatar?: string | null },
>(character: T): T & { avatar: string | null } {
  if (!character) return character as T & { avatar: string | null };
  return {
    ...character,
    avatar: character.avatar ? buildCharacterAvatarUrl(character.avatar) : null,
  };
}

export function enrichCharactersWithAvatarUrls<
  T extends { avatar?: string | null },
>(characters: T[]): Array<T & { avatar: string | null }> {
  return characters.map((c) => enrichCharacterWithAvatarUrl(c));
}
