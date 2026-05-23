import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import hbs from 'hbs';
import * as path from 'path';
import * as fs from 'fs';
import { envs } from '../config/envs';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    const port = envs.mailPort;
    this.transporter = nodemailer.createTransport({
      host: envs.mailHost,
      port,
      secure: port === 465,
      requireTLS: port === 587,
      auth: {
        user: envs.mailUser,
        pass: envs.mailPassword,
      },
    });
  }

  async sendPasswordRecovery(
    email: string,
    name: string,
    recoveryUrl: string,
  ): Promise<void> {
    const html = this.render('password-recovery.hbs', {
      name,
      recoveryUrl,
      year: new Date().getFullYear(),
    });
    await this.send(email, 'Distop-IA · Renovar contraseña', html);
    this.logger.log(`Password recovery email sent to ${email}`);
  }

  async sendWelcome(email: string, name: string): Promise<void> {
    const html = this.render('welcome.hbs', {
      name,
      email,
      platformUrl: envs.frontendUrl || '',
      year: new Date().getFullYear(),
    });
    await this.send(email, 'Distop-IA · Bienvenido al cónclave', html);
    this.logger.log(`Welcome email sent to ${email}`);
  }

  async sendChronicleInviteExisting(
    email: string,
    inviterNickname: string,
    inviterEmail: string,
    chronicleName: string,
    acceptUrl: string,
    expiresAt: Date,
  ): Promise<void> {
    const html = this.render('chronicle-invite-existing.hbs', {
      email,
      inviterNickname,
      inviterEmail,
      chronicleName,
      acceptUrl,
      expiresAt: this.formatDate(expiresAt),
      year: new Date().getFullYear(),
    });
    await this.send(
      email,
      `Distop-IA · Has sido convocado a "${chronicleName}"`,
      html,
    );
    this.logger.log(
      `Chronicle invite (existing) sent to ${email} for "${chronicleName}"`,
    );
  }

  async sendChronicleInviteNew(
    email: string,
    inviterNickname: string,
    inviterEmail: string,
    chronicleName: string,
    registerUrl: string,
    expiresAt: Date,
  ): Promise<void> {
    const html = this.render('chronicle-invite-new.hbs', {
      email,
      inviterNickname,
      inviterEmail,
      chronicleName,
      registerUrl,
      expiresAt: this.formatDate(expiresAt),
      year: new Date().getFullYear(),
    });
    await this.send(email, `Distop-IA · Te invitan a "${chronicleName}"`, html);
    this.logger.log(
      `Chronicle invite (new) sent to ${email} for "${chronicleName}"`,
    );
  }

  private render(templateName: string, data: Record<string, unknown>): string {
    const templatePath = path.join(__dirname, 'templates', templateName);
    const source = fs.readFileSync(templatePath, 'utf-8');
    const template = hbs.handlebars.compile(source);
    return template(data);
  }

  private async send(to: string, subject: string, html: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: envs.mailFrom,
        to,
        subject,
        html,
      });
    } catch (error) {
      this.logger.error(`Failed to send "${subject}" to ${to}:`, error);
      throw error;
    }
  }

  private formatDate(date: Date): string {
    return new Intl.DateTimeFormat('es-CL', {
      dateStyle: 'long',
      timeStyle: 'short',
      timeZone: 'America/Santiago',
    }).format(date);
  }
}
