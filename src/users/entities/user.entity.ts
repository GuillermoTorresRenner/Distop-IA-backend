import { Prisma } from '@prisma/client';

export class User implements Prisma.UsersCreateInput {
  id?: string | undefined;
  email!: string;
  nickname!: string;
  password!: string;
  isActive?: boolean | undefined;
  createdAt?: string | Date | undefined;
  updatedAt?: string | Date | undefined;
}
