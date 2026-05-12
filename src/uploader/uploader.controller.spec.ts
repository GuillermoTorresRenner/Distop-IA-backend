import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { UploaderController } from './uploader.controller';
import { UploaderService } from './uploader.service';

describe('UploaderController', () => {
  let controller: UploaderController;
  let uploaderService: UploaderService;

  const mockUploaderService = {
    uploadUserAvatar: jest.fn(),
  };

  const mockFile = {
    filename: 'avatar.jpg',
    mimetype: 'image/jpeg',
    size: 2048,
    destination: '/uploads',
    path: '/uploads/avatar.jpg',
  } as Express.Multer.File;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UploaderController],
      providers: [
        {
          provide: UploaderService,
          useValue: mockUploaderService,
        },
      ],
    }).compile();

    controller = module.get<UploaderController>(UploaderController);
    uploaderService = module.get<UploaderService>(UploaderService);
  });

  describe('uploadUserAvatar', () => {
    it('debe subir avatar de usuario exitosamente', async () => {
      mockUploaderService.uploadUserAvatar.mockResolvedValue(
        '/images/users/avatars/user-1.webp',
      );

      const result = await controller.uploadUserAvatar('user-1', mockFile);

      expect(result).toBeDefined();
      expect(uploaderService.uploadUserAvatar).toHaveBeenCalledWith(
        mockFile,
        'user-1',
      );
    });

    it('debe lanzar BadRequestException si no se proporciona archivo', async () => {
      await expect(
        controller.uploadUserAvatar(
          'user-1',
          null as unknown as Express.Multer.File,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('debe lanzar BadRequestException si el tipo de archivo no es válido', async () => {
      const invalidFile = {
        ...mockFile,
        mimetype: 'application/pdf',
      } as Express.Multer.File;

      await expect(
        controller.uploadUserAvatar('user-1', invalidFile),
      ).rejects.toThrow(BadRequestException);
    });

    it('debe lanzar BadRequestException si el archivo es muy grande', async () => {
      const largeFile = {
        ...mockFile,
        size: 6 * 1024 * 1024,
      } as Express.Multer.File;

      await expect(
        controller.uploadUserAvatar('user-1', largeFile),
      ).rejects.toThrow(BadRequestException);
    });

    it('debe aceptar archivos JPEG, PNG, WebP y GIF', async () => {
      mockUploaderService.uploadUserAvatar.mockResolvedValue(
        '/images/users/avatars/user-1.webp',
      );

      const mimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

      for (const mimeType of mimeTypes) {
        const fileWithMime = { ...mockFile, mimetype: mimeType };
        await controller.uploadUserAvatar('user-1', fileWithMime);
        expect(uploaderService.uploadUserAvatar).toHaveBeenCalled();
      }
    });
  });

  it('debe estar definido el controlador', () => {
    expect(controller).toBeDefined();
  });

  it('debe tener método uploadUserAvatar', () => {
    expect(typeof controller.uploadUserAvatar).toBe('function');
  });
});
