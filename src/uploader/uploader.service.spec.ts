import { Test, TestingModule } from '@nestjs/testing';
import { UploaderService } from './uploader.service';
import * as sharp from 'sharp';

jest.mock('fs-extra');
jest.mock('sharp');

describe('UploaderService', () => {
  let service: UploaderService;

  const mockFile = {
    filename: 'avatar.jpg',
    mimetype: 'image/jpeg',
    size: 2048,
    destination: '/uploads',
    path: '/uploads/avatar.jpg',
    buffer: Buffer.from('fake image data'),
  } as Express.Multer.File;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [UploaderService],
    }).compile();

    service = module.get<UploaderService>(UploaderService);
  });

  describe('uploadUserAvatar', () => {
    it('debe convertir y subir un avatar exitosamente', async () => {
      const mockSharpInstance = {
        webp: jest.fn().mockReturnThis(),
        toFile: jest.fn().mockResolvedValue({ filename: 'avatar.webp' }),
      };

      (sharp as unknown as jest.Mock).mockReturnValue(mockSharpInstance);

      const result = await service.uploadUserAvatar(mockFile, 'user-1');

      expect(result.filename).toContain('user-1');
      expect(result.filename).toContain('.webp');
      expect(sharp).toHaveBeenCalledWith(mockFile.buffer);
      expect(mockSharpInstance.webp).toHaveBeenCalledWith({ quality: 80 });
    });
  });

  it('debe estar definido el servicio', () => {
    expect(service).toBeDefined();
  });

  it('debe tener método uploadUserAvatar', () => {
    expect(typeof service.uploadUserAvatar).toBe('function');
  });

  it('debe tener método deleteUserAvatar', () => {
    expect(typeof service.deleteUserAvatar).toBe('function');
  });
});
