import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';
import { PrismaService } from '../../prisma/prisma.service';

jest.mock('../../prisma/prisma.service');

beforeEach(() => {
  mockReset(prismaMock);
});

export const prismaMock: DeepMockProxy<PrismaService> =
  mockDeep<PrismaService>();
