import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import * as bcrypt from 'bcrypt';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Uploader E2E', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let accessToken: string | undefined;
  let userId: string;
  const userEmail = `uploader-${Date.now()}@test.com`;

  const createPngBuffer = (): Buffer => {
    return Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x08, 0x00, 0x00, 0x00, 0x08,
      0x08, 0x06, 0x00, 0x00, 0x00, 0xc4, 0x0f, 0xbe, 0x8b, 0x00, 0x00, 0x00,
      0x0e, 0x49, 0x44, 0x41, 0x54, 0x08, 0xd7, 0x63, 0xf8, 0xcf, 0xc0, 0x00,
      0x00, 0x00, 0x03, 0x00, 0x01, 0x4b, 0x5a, 0x3c, 0x69, 0x00, 0x00, 0x00,
      0x00, 0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82,
    ]);
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();

    prisma = app.get(PrismaService);

    const user = await prisma.users.create({
      data: {
        email: userEmail,
        password: await bcrypt.hash('Password123', 10),
      },
    });
    userId = user.id;

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: userEmail, password: 'Password123' });

    const accessCookie = (
      loginResponse.headers['set-cookie'] as unknown as string[]
    ).find((c: string) => c.includes('accessToken'));
    accessToken = accessCookie?.split('=')[1]?.split(';')[0];
  });

  afterAll(async () => {
    await prisma.users.deleteMany({
      where: { email: { contains: userEmail } },
    });
    await app.close();
  });

  describe('POST /upload/user-avatar/:userId', () => {
    it('should upload user avatar successfully', async () => {
      const response = await request(app.getHttpServer())
        .post(`/upload/user-avatar/${userId}`)
        .set('Cookie', [`accessToken=${accessToken}`])
        .attach('file', createPngBuffer(), { contentType: 'image/png' })
        .expect(201);

      expect(response.body.filename).toBeDefined();
      expect(response.body.filename).toContain('.webp');
    });

    it('should fail upload without file', async () => {
      await request(app.getHttpServer())
        .post(`/upload/user-avatar/${userId}`)
        .set('Cookie', [`accessToken=${accessToken}`])
        .expect(400);
    });

    it('should fail upload with invalid file type', async () => {
      await request(app.getHttpServer())
        .post(`/upload/user-avatar/${userId}`)
        .set('Cookie', [`accessToken=${accessToken}`])
        .attach('file', Buffer.from('not an image'), {
          contentType: 'application/pdf',
        })
        .expect(400);
    });

    it('should deny upload without authentication', async () => {
      await request(app.getHttpServer())
        .post(`/upload/user-avatar/${userId}`)
        .attach('file', createPngBuffer(), { contentType: 'image/png' })
        .expect(401);
    });
  });
});
