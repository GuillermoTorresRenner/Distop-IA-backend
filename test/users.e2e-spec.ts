import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import * as bcrypt from 'bcrypt';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Users E2E', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let accessToken: string | undefined;
  let userId: string;
  const userEmail = `users-${Date.now()}@test.com`;

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

  describe('GET /users', () => {
    it('should list users with pagination', async () => {
      const response = await request(app.getHttpServer())
        .get('/users')
        .query({ page: 1, pageSize: 10 })
        .set('Cookie', [`accessToken=${accessToken}`])
        .expect(200);

      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.total).toBeDefined();
    });

    it('should deny access without authentication', async () => {
      await request(app.getHttpServer()).get('/users').expect(401);
    });
  });

  describe('GET /users/:id', () => {
    it('should get user by ID', async () => {
      const response = await request(app.getHttpServer())
        .get(`/users/${userId}`)
        .set('Cookie', [`accessToken=${accessToken}`])
        .expect(200);

      expect(response.body.id).toBe(userId);
      expect(response.body.password).toBeUndefined();
    });

    it('should return 404 for non-existent user', async () => {
      const fakeId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
      await request(app.getHttpServer())
        .get(`/users/${fakeId}`)
        .set('Cookie', [`accessToken=${accessToken}`])
        .expect(404);
    });
  });

  describe('PUT /users/:id', () => {
    it('should update user password', async () => {
      await request(app.getHttpServer())
        .put(`/users/${userId}`)
        .set('Cookie', [`accessToken=${accessToken}`])
        .send({ password: 'NewPassword123' })
        .expect(200);
    });
  });

  describe('DELETE /users/:id', () => {
    it('should soft delete user', async () => {
      const tempUser = await prisma.users.create({
        data: {
          email: `delete-${Date.now()}@test.com`,
          password: await bcrypt.hash('Password123', 10),
        },
      });

      const response = await request(app.getHttpServer())
        .delete(`/users/${tempUser.id}`)
        .set('Cookie', [`accessToken=${accessToken}`])
        .expect(200);

      expect(response.body.isActive).toBe(false);
    });
  });
});
