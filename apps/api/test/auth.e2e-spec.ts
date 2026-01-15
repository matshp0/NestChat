/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, type TestingModule } from '@nestjs/testing';
import { AppModule } from './../src/app.module';
import {
  FastifyAdapter,
  type NestFastifyApplication,
} from '@nestjs/platform-fastify';
import fastifyCookie from '@fastify/cookie';
import { disconnectPrisma, resetDatabase } from './utils/prismaTestHelper';
import { nullableString } from './utils/nullableStringMatcher';
import { ValidationPipe } from '@nestjs/common';

const user = {
  username: 'testUser',
  email: 'testEmail@test.com',
  password: 'strongPassword123',
};

describe('AuthController (e2e)', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );

    await app.register(fastifyCookie);

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  beforeEach(async () => {
    await resetDatabase();
  });

  afterAll(async () => {
    await app.close();
    await resetDatabase();
    await disconnectPrisma();
  });

  describe('POST auth/signup', () => {
    it('should succesfully create user', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/auth/signup',
        payload: user,
      });

      expect(res.statusCode).toEqual(201);
      const json = JSON.parse(res.body);

      expect(json).toMatchObject({
        id: expect.any(Number),
        username: expect.any(String),
        displayName: nullableString,
        avatarUrl: nullableString,
        email: expect.any(String),
      });
    });
  });

  describe('POST auth/login', () => {
    it('should return access token and set httpOnly cookie', async () => {
      await app.inject({
        method: 'POST',
        url: '/auth/signup',
        payload: user,
      });

      const res = await app.inject({
        method: 'POST',
        url: '/auth/login',
        payload: {
          email: user.email,
          password: user.password,
        },
      });

      expect(res.statusCode).toEqual(201);

      const body = res.json();
      expect(body).toHaveProperty('accessToken', expect.any(String));

      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();

      const cookieString = Array.isArray(cookies) ? cookies[0] : cookies;
      expect(cookieString).toContain('refresh_token=');
      expect(cookieString).toContain('HttpOnly');
      expect(cookieString).toContain('Path=/auth');
    });
  });

  describe('GET auth/refresh', () => {
    it('should return 400 if no cookie is present', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/auth/refresh',
      });
      expect(res.statusCode).toEqual(400);
    });

    it('should return 400 if cookie is invalid', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/auth/refresh',
        cookies: {
          refresh_token: 'some-invalid-refresh-token',
        },
      });

      expect(res.statusCode).toEqual(400);
    });

    it('should return access_token if cookie is valid', async () => {
      await app.inject({
        method: 'POST',
        url: '/auth/signup',
        payload: user,
      });
      const loginRes = await app.inject({
        method: 'POST',
        url: '/auth/login',
        payload: {
          email: user.email,
          password: user.password,
        },
      });
      const refreshCookie = loginRes.cookies.find(
        (cookie) => cookie.name === 'refresh_token',
      )!;
      const res = await app.inject({
        method: 'GET',
        url: '/auth/refresh',
        cookies: {
          refresh_token: refreshCookie.value,
        },
      });

      const json = JSON.parse(res.body);

      expect(res.statusCode).toEqual(200);
      expect(json).toMatchObject({
        accessToken: expect.any(String),
      });
    });
  });
});
