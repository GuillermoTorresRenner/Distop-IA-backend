import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { UploaderService } from '../uploader/uploader.service';

describe('UsersService', () => {
  let service: UsersService;
  let prismaService: PrismaService;
  let uploaderService: UploaderService;

  const mockUser = {
    id: 'user-1',
    email: 'john@example.com',
    password: 'hashed-password',
    isActive: true,
    avatar: null,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  };

  const mockPrismaService = {
    users: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  };

  const mockUploaderService = {
    deleteUserAvatar: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: UploaderService,
          useValue: mockUploaderService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prismaService = module.get<PrismaService>(PrismaService);
    uploaderService = module.get<UploaderService>(UploaderService);
  });

  describe('findAll', () => {
    it('debe retornar lista paginada de usuarios sin filtros', async () => {
      const mockUsers = [mockUser];
      mockPrismaService.users.findMany.mockResolvedValue(mockUsers);
      mockPrismaService.users.count.mockResolvedValue(1);

      const result = await service.findAll(1, 10);

      expect(result).toEqual({
        data: [
          expect.objectContaining({
            id: 'user-1',
            email: 'john@example.com',
          }),
        ],
        total: 1,
        page: 1,
        pageSize: 10,
        totalPages: 1,
      });
      expect(prismaService.users.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 10,
          where: {},
        }),
      );
    });

    it('debe aplicar filtro por isActive', async () => {
      mockPrismaService.users.findMany.mockResolvedValue([mockUser]);
      mockPrismaService.users.count.mockResolvedValue(1);

      await service.findAll(1, 10, { isActive: true });

      expect(prismaService.users.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isActive: true,
          }),
        }),
      );
    });

    it('debe aplicar filtro por email', async () => {
      mockPrismaService.users.findMany.mockResolvedValue([mockUser]);
      mockPrismaService.users.count.mockResolvedValue(1);

      await service.findAll(1, 10, { email: 'john@example.com' });

      expect(prismaService.users.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            email: {
              contains: 'john@example.com',
              mode: 'insensitive',
            },
          }),
        }),
      );
    });

    it('debe calcular pagination correctamente', async () => {
      mockPrismaService.users.findMany.mockResolvedValue([mockUser]);
      mockPrismaService.users.count.mockResolvedValue(25);

      const result = await service.findAll(2, 10);

      expect(result.page).toBe(2);
      expect(result.pageSize).toBe(10);
      expect(result.totalPages).toBe(3);
      expect(prismaService.users.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10,
          take: 10,
        }),
      );
    });

    it('debe excluir campo password en respuesta', async () => {
      const userWithoutPassword = { ...mockUser };
      delete userWithoutPassword.password;
      mockPrismaService.users.findMany.mockResolvedValue([userWithoutPassword]);
      mockPrismaService.users.count.mockResolvedValue(1);

      const result = await service.findAll(1, 10);

      expect(result.data[0]).not.toHaveProperty('password');
    });
  });

  describe('findOne', () => {
    it('debe retornar un usuario por ID', async () => {
      const userWithoutPassword = { ...mockUser };
      delete userWithoutPassword.password;
      mockPrismaService.users.findUnique.mockResolvedValue(userWithoutPassword);

      const result = await service.findOne('user-1');

      expect(result).toEqual(
        expect.objectContaining({
          id: 'user-1',
          email: 'john@example.com',
        }),
      );
      expect(prismaService.users.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-1' },
      });
    });

    it('debe lanzar NotFoundException si usuario no existe', async () => {
      mockPrismaService.users.findUnique.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('debe excluir password en respuesta', async () => {
      const userWithoutPassword = { ...mockUser };
      delete userWithoutPassword.password;
      mockPrismaService.users.findUnique.mockResolvedValue(userWithoutPassword);

      const result = await service.findOne('user-1');

      expect(result).not.toHaveProperty('password');
    });
  });

  describe('update', () => {
    it('debe actualizar un usuario exitosamente', async () => {
      mockPrismaService.users.findUnique.mockResolvedValue(mockUser);
      const hashedPassword = 'hashed-new-password';
      mockPrismaService.users.update.mockResolvedValue({
        ...mockUser,
        password: hashedPassword,
      });

      const result = await service.update('user-1', {
        password: 'new-password',
      });

      expect(result).toEqual(
        expect.objectContaining({
          id: 'user-1',
        }),
      );
      expect(prismaService.users.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'user-1' },
        }),
      );
    });

    it('debe lanzar NotFoundException si usuario no existe', async () => {
      mockPrismaService.users.findUnique.mockResolvedValue(null);

      await expect(
        service.update('nonexistent', { password: 'new-password' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('debe hashear nueva contraseña si se proporciona', async () => {
      mockPrismaService.users.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.users.update.mockResolvedValue(mockUser);

      await service.update('user-1', { password: 'new-password' });

      const callArgs = prismaService.users.update.mock.calls[0][0];
      expect(callArgs.data.password).not.toBe('new-password');
    });

    it('debe excluir password en respuesta', async () => {
      mockPrismaService.users.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.users.update.mockResolvedValue(mockUser);

      const result = await service.update('user-1', {
        password: 'new-password',
      });

      expect(result).not.toHaveProperty('password');
    });
  });

  describe('remove', () => {
    it('debe desactivar un usuario marcándolo como inactivo', async () => {
      mockPrismaService.users.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.users.update.mockResolvedValue({
        ...mockUser,
        isActive: false,
      });

      const result = await service.remove('user-1');

      expect(result).toEqual(
        expect.objectContaining({
          id: 'user-1',
        }),
      );
      expect(prismaService.users.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'user-1' },
          data: expect.objectContaining({
            isActive: false,
          }),
        }),
      );
    });

    it('debe lanzar NotFoundException si usuario no existe', async () => {
      mockPrismaService.users.findUnique.mockResolvedValue(null);

      await expect(service.remove('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('debe eliminar avatar si existe', async () => {
      const userWithAvatar = { ...mockUser, avatar: 'avatar-url.webp' };
      mockPrismaService.users.findUnique.mockResolvedValue(userWithAvatar);
      mockPrismaService.users.update.mockResolvedValue({
        ...userWithAvatar,
        isActive: false,
        avatar: null,
      });

      await service.remove('user-1');

      expect(uploaderService.deleteUserAvatar).toHaveBeenCalledWith(
        'avatar-url.webp',
      );
    });
  });

  describe('updateAvatar', () => {
    it('debe actualizar avatar de un usuario', async () => {
      mockPrismaService.users.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.users.update.mockResolvedValue({
        ...mockUser,
        avatar: 'new-avatar.webp',
      });

      const result = await service.updateAvatar('user-1', 'new-avatar.webp');

      expect(result).toEqual(
        expect.objectContaining({
          avatar: 'new-avatar.webp',
        }),
      );
      expect(prismaService.users.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'user-1' },
          data: { avatar: 'new-avatar.webp' },
        }),
      );
    });

    it('debe lanzar NotFoundException si usuario no existe', async () => {
      mockPrismaService.users.findUnique.mockResolvedValue(null);

      await expect(
        service.updateAvatar('nonexistent', 'avatar.webp'),
      ).rejects.toThrow(NotFoundException);
    });

    it('debe eliminar avatar anterior si existe', async () => {
      const userWithAvatar = { ...mockUser, avatar: 'old-avatar.webp' };
      mockPrismaService.users.findUnique.mockResolvedValue(userWithAvatar);
      mockPrismaService.users.update.mockResolvedValue({
        ...userWithAvatar,
        avatar: 'new-avatar.webp',
      });

      await service.updateAvatar('user-1', 'new-avatar.webp');

      expect(uploaderService.deleteUserAvatar).toHaveBeenCalledWith(
        'old-avatar.webp',
      );
    });
  });

  it('debe estar definido el servicio', () => {
    expect(service).toBeDefined();
  });
});
