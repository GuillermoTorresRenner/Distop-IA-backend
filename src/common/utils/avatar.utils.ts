/**
 * Devuelve una URL RELATIVA al dominio público (sin host) que sirve el avatar
 * del usuario. Ver `chronicle.utils.ts` para el razonamiento completo:
 * el back no está expuesto a internet, las imágenes se sirven a través de
 * nginx-proxy-manager con una Custom Location `/images` apuntando al back.
 */
export function buildUserAvatarUrl(filename: string): string | null {
  if (!filename) {
    return null;
  }
  return `/images/users/avatars/${filename}`;
}

export function enrichUserWithAvatarUrl<T extends { avatar?: string | null }>(
  user: T,
): T & { avatar: string | null } {
  if (!user) return user as T & { avatar: string | null };

  return {
    ...user,
    avatar: user.avatar ? buildUserAvatarUrl(user.avatar) : null,
  };
}

export function enrichUsersWithAvatarUrls<T extends { avatar?: string | null }>(
  users: T[],
): Array<T & { avatar: string | null }> {
  return users.map((user) => enrichUserWithAvatarUrl(user));
}
