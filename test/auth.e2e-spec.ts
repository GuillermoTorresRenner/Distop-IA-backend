import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

describe('Auth E2E', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const testUser = {
    email: 'auth-e2e@test.com',
    password: 'Password123',
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

    await prisma.users.deleteMany({
      where: { email: { contains: 'e2e@test.com' } },
    });
  });

  afterAll(async () => {
    await prisma.users.deleteMany({
      where: { email: { contains: 'e2e@test.com' } },
    });
    await app.close();
  });

  describe('POST /auth/register', () => {
    it('should register a new user with valid data', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser)
        .expect(201);

      expect(response.body.ok).toBe(true);
    });

    it('should fail registration with duplicate email', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser)
        .expect(400);

      expect(response.body.message).toContain('already registered');
    });

    it('should fail registration with invalid email format', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'invalid-format',
          password: 'Password123',
        })
        .expect(400);
    });

    it('should fail registration with password too short', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'short-e2e@test.com',
          password: '123',
        })
        .expect(400);
    });
  });

  describe('POST /auth/login', () => {
    const loginEmail = 'login-e2e@test.com';
    const loginPassword = 'Password123';

    beforeEach(async () => {
      await prisma.users.deleteMany({ where: { email: loginEmail } });
      await prisma.users.create({
        data: {
          email: loginEmail,
          password: await bcrypt.hash(loginPassword, 10),
        },
      });
    });

    it('should login successfully with valid credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: loginEmail, password: loginPassword })
        .expect(201);

      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe(loginEmail);
      expect(response.body.user.password).toBeUndefined();
      expect(response.headers['set-cookie']).toBeDefined();
    });

    it('should fail login with non-existent email', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'nonexistent-e2e@test.com',
          password: loginPassword,
        })
        .expect(401);
    });

    it('should fail login with incorrect password', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: loginEmail, password: 'WrongPassword123' })
        .expect(401);
    });
  });

  describe('GET /auth/me', () => {
    const meEmail = 'me-e2e@test.com';
    const mePassword = 'Password123';
    let accessToken: string | undefined;

    beforeEach(async () => {
      await prisma.users.deleteMany({ where: { email: meEmail } });
      await prisma.users.create({
        data: {
          email: meEmail,
          password: await bcrypt.hash(mePassword, 10),
        },
      });

      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: meEmail, password: mePassword });

      const accessCookie = (
        loginResponse.headers['set-cookie'] as unknown as string[]
      ).find((c: string) => c.includes('accessToken'));
      accessToken = accessCookie?.split('=')[1]?.split(';')[0];
    });

    it('should return authenticated user profile', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/me')
        .set('Cookie', [`accessToken=${accessToken}`])
        .expect(200);

      expect(response.body.email).toBe(meEmail);
      expect(response.body.password).toBeUndefined();
    });

    it('should fail without authentication token', async () => {
      await request(app.getHttpServer()).get('/auth/me').expect(401);
    });
  });
});
