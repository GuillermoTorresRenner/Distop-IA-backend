import { envs } from '../../config/envs';

export function buildUserAvatarUrl(filename: string): string | null {
  if (!filename) {
    return null;
  }
  return `${envs.backendUrl}/images/users/avatars/${filename}`;
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
