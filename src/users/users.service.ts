import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { FilterUsersDto } from './dto/filter-users.dto';
import { UploaderService } from '../uploader/uploader.service';

type UserWithoutPassword = {
  id: string;
  email: string;
  nickname: string;
  isActive: boolean | null;
  avatar: string | null;
  createdAt: Date;
  updatedAt: Date;
};

interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly uploaderService: UploaderService,
  ) {}

  async findAll(
    page: number = 1,
    pageSize: number = 10,
    filters?: FilterUsersDto,
  ): Promise<PaginatedResult<UserWithoutPassword>> {
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const where: Prisma.UsersWhereInput = {};

    if (filters?.email) {
      where.email = {
        contains: filters.email,
        mode: 'insensitive',
      };
    }

    if (filters?.nickname) {
      where.nickname = {
        contains: filters.nickname,
        mode: 'insensitive',
      };
    }

    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    const [users, total] = await Promise.all([
      this.prisma.users.findMany({
        where,
        skip,
        take,
        select: {
          id: true,
          email: true,
          nickname: true,
          isActive: true,
          avatar: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.users.count({ where }),
    ]);

    const totalPages = Math.ceil(total / pageSize);

    return {
      data: users,
      total,
      page,
      pageSize,
      totalPages,
    };
  }

  async findOne(
    id: string,
  ): Promise<Omit<Prisma.UsersGetPayload<Record<string, never>>, 'password'>> {
    const user = await this.prisma.users.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User #${id} not found`);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...result } = user;
    return result;
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<Omit<Prisma.UsersGetPayload<Record<string, never>>, 'password'>> {
    await this.findOne(id);

    const data: Record<string, unknown> = {};

    if (updateUserDto.email) {
      data.email = updateUserDto.email;
    }

    if (updateUserDto.nickname) {
      const taken = await this.prisma.users.findFirst({
        where: {
          nickname: { equals: updateUserDto.nickname, mode: 'insensitive' },
          NOT: { id },
        },
        select: { id: true },
      });
      if (taken) {
        throw new BadRequestException('Nickname already taken');
      }
      data.nickname = updateUserDto.nickname;
    }

    if (updateUserDto.password) {
      data.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    const user = await this.prisma.users.update({
      where: { id },
      data,
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...result } = user;
    return result;
  }

  async remove(
    id: string,
  ): Promise<Omit<Prisma.UsersGetPayload<Record<string, never>>, 'password'>> {
    const user = await this.findOne(id);

    if (user.avatar) {
      await this.uploaderService.deleteUserAvatar(user.avatar);
    }

    const updatedUser = await this.prisma.users.update({
      where: { id },
      data: { isActive: false, avatar: null },
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...result } = updatedUser;
    return result;
  }

  async updateAvatar(
    id: string,
    filename: string,
  ): Promise<UserWithoutPassword> {
    const currentUser = await this.findOne(id);

    if (currentUser.avatar) {
      await this.uploaderService.deleteUserAvatar(currentUser.avatar);
    }

    const user = await this.prisma.users.update({
      where: { id },
      data: { avatar: filename },
      select: {
        id: true,
        email: true,
        nickname: true,
        isActive: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  async clearAvatar(id: string): Promise<UserWithoutPassword> {
    const currentUser = await this.findOne(id);

    if (currentUser.avatar) {
      await this.uploaderService.deleteUserAvatar(currentUser.avatar);
    }

    const user = await this.prisma.users.update({
      where: { id },
      data: { avatar: null },
      select: {
        id: true,
        email: true,
        nickname: true,
        isActive: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }
}
