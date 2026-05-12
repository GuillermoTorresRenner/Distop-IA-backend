import { Test, TestingModule } from '@nestjs/testing';
import * as nodemailer from 'nodemailer';
import hbs from 'hbs';
import * as fs from 'fs';
import { MailService } from './mail.service';
import { envs } from '../config/envs';

jest.mock('nodemailer');
jest.mock('hbs', () => ({
  __esModule: true,
  default: {
    handlebars: {
      compile: jest.fn(),
    },
  },
}));
jest.mock('fs');

describe('MailService', () => {
  let service: MailService;
  let mockSendMail: jest.Mock;

  beforeEach(async () => {
    jest.clearAllMocks();

    mockSendMail = jest.fn().mockResolvedValue({});
    (nodemailer.createTransport as jest.Mock).mockReturnValue({
      sendMail: mockSendMail,
    });

    (fs.readFileSync as jest.Mock).mockReturnValue('<html>{{name}}</html>');

    (hbs.handlebars.compile as jest.Mock).mockReturnValue(
      (context: Record<string, unknown>) =>
        `<html>${String(context.name)}</html>`,
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [MailService],
    }).compile();

    service = module.get<MailService>(MailService);
    jest.spyOn(service['logger'], 'log').mockImplementation();
    jest.spyOn(service['logger'], 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('sendPasswordRecovery', () => {
    it('sends recovery email with template', async () => {
      await service.sendPasswordRecovery(
        'user@example.com',
        'John',
        'https://example.com/recover?token=abc',
      );

      expect(fs.readFileSync).toHaveBeenCalledWith(
        expect.stringContaining('password-recovery.hbs'),
        'utf-8',
      );
      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          from: envs.mailFrom,
          to: 'user@example.com',
          html: expect.stringContaining('John'),
        }),
      );
    });

    it('throws when mail sending fails', async () => {
      mockSendMail.mockRejectedValueOnce(new Error('SMTP error'));

      await expect(
        service.sendPasswordRecovery('user@example.com', 'John', 'url'),
      ).rejects.toThrow('SMTP error');
    });
  });

  describe('sendWelcome', () => {
    it('sends welcome email', async () => {
      await service.sendWelcome('new@example.com', 'Jane');

      expect(fs.readFileSync).toHaveBeenCalledWith(
        expect.stringContaining('welcome.hbs'),
        'utf-8',
      );
      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'new@example.com',
          html: expect.stringContaining('Jane'),
        }),
      );
    });

    it('throws when mail sending fails', async () => {
      mockSendMail.mockRejectedValueOnce(new Error('SMTP error'));

      await expect(
        service.sendWelcome('new@example.com', 'Jane'),
      ).rejects.toThrow('SMTP error');
    });
  });
});
