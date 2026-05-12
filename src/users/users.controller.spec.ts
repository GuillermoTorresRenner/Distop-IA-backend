import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UploaderService } from '../uploader/uploader.service';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: UsersService;

  const mockUser = {
    id: 'user-1',
    email: 'john@example.com',
    isActive: true,
    avatar: null,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  };

  const mockUsersService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByEmail: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    updateAvatar: jest.fn(),
  };

  const mockUploaderService = {
    uploadUserAvatar: jest.fn(),
    deleteUserAvatar: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: UploaderService,
          useValue: mockUploaderService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
  });

  describe('findAll', () => {
    it('debe retornar lista de usuarios', async () => {
      const mockResult = {
        data: [mockUser],
        total: 1,
        page: 1,
        pageSize: 10,
        totalPages: 1,
      };

      mockUsersService.findAll.mockResolvedValue(mockResult);

      const result = await controller.findAll(1, 10, undefined);

      expect(result).toEqual(mockResult);
      expect(usersService.findAll).toHaveBeenCalledWith(1, 10, undefined);
    });

    it('debe pasar filtros al servicio', async () => {
      const mockResult = {
        data: [mockUser],
        total: 1,
        page: 1,
        pageSize: 10,
        totalPages: 1,
      };

      mockUsersService.findAll.mockResolvedValue(mockResult);

      const filters = { email: 'john@example.com' };
      await controller.findAll(1, 10, filters);

      expect(usersService.findAll).toHaveBeenCalledWith(1, 10, filters);
    });
  });

  describe('findOne', () => {
    it('debe retornar un usuario por ID', async () => {
      mockUsersService.findOne.mockResolvedValue(mockUser);

      const result = await controller.findOne('user-1');

      expect(result).toEqual(mockUser);
      expect(usersService.findOne).toHaveBeenCalledWith('user-1');
    });
  });

  describe('update', () => {
    it('debe actualizar un usuario', async () => {
      const updatedUser = { ...mockUser };
      mockUsersService.update.mockResolvedValue(updatedUser);

      const updateDto = { password: 'new-password' };
      const result = await controller.update('user-1', updateDto);

      expect(result).toEqual(updatedUser);
      expect(usersService.update).toHaveBeenCalledWith('user-1', updateDto);
    });
  });

  describe('remove', () => {
    it('debe eliminar un usuario', async () => {
      mockUsersService.remove.mockResolvedValue(mockUser);

      const result = await controller.remove('user-1');

      expect(result).toEqual(mockUser);
      expect(usersService.remove).toHaveBeenCalledWith('user-1');
    });
  });

  describe('uploadAvatar', () => {
    it('debe subir avatar para un usuario', async () => {
      const mockFile = {
        filename: 'avatar.jpg',
        mimetype: 'image/jpeg',
        size: 2048,
        destination: '/uploads',
        path: '/uploads/avatar.jpg',
        buffer: Buffer.from('mock'),
      } as Express.Multer.File;

      const userWithAvatar = { ...mockUser, avatar: 'avatar-filename.webp' };
      mockUploaderService.uploadUserAvatar.mockResolvedValue({
        filename: 'avatar-filename.webp',
      });
      mockUsersService.updateAvatar.mockResolvedValue(userWithAvatar);

      const result = await controller.uploadAvatar('user-1', mockFile);

      expect(result.avatar).toContain('avatar-filename.webp');
      expect(mockUploaderService.uploadUserAvatar).toHaveBeenCalledWith(
        mockFile,
        'user-1',
      );
      expect(usersService.updateAvatar).toHaveBeenCalledWith(
        'user-1',
        'avatar-filename.webp',
      );
    });
  });

  it('debe estar definido el controlador', () => {
    expect(controller).toBeDefined();
  });
});
