import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class EmailService {
  private transporter: Transporter;
  private readonly logger = new Logger(EmailService.name);

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('MAIL_HOST'),
      port: this.configService.get<number>('MAIL_PORT'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: this.configService.get<string>('MAIL_USER'),
        pass: this.configService.get<string>('MAIL_PASS'),
      },
    });

    // Verificar conexión
    this.transporter.verify((error) => {
      if (error) {
        this.logger.error('Error al conectar con el servidor de email:', error);
      } else {
        this.logger.log('✅ Servidor de email listo para enviar mensajes');
      }
    });
  }

  async sendWelcomeEmail(userData: {
    email: string;
    nombreCompleto: string;
    usuarioRed: string;
    rol: string;
    area: string;
  }): Promise<void> {
    try {
      const template = this.loadTemplate('welcome.html');
      const html = this.replaceVariables(template, userData);

      await this.transporter.sendMail({
        from: this.configService.get<string>('MAIL_FROM'),
        to: userData.email,
        subject: '🎉 Bienvenido al Sistema de Aprobaciones',
        html,
      });

      this.logger.log(`Email de bienvenida enviado a ${userData.email}`);
    } catch (error) {
      this.logger.error(`Error al enviar email de bienvenida a ${userData.email}:`, error);
      throw error;
    }
  }

  async sendNewSolicitudEmail(data: {
    responsableEmail: string;
    responsableNombre: string;
    codigoSolicitud: string;
    titulo: string;
    tipoSolicitud: string;
    solicitanteNombre: string;
    solicitanteEmail: string;
    fechaSolicitud: string;
    descripcion: string;
    solicitudId: string;
  }): Promise<void> {
    try {
      const template = this.loadTemplate('nueva-solicitud.html');
      const html = this.replaceVariables(template, data);

      await this.transporter.sendMail({
        from: this.configService.get<string>('MAIL_FROM'),
        to: data.responsableEmail,
        subject: `⚠️ Nueva Solicitud Pendiente: ${data.codigoSolicitud}`,
        html,
      });

      this.logger.log(`Email de nueva solicitud enviado a ${data.responsableEmail}`);
    } catch (error) {
      this.logger.error(`Error al enviar email de nueva solicitud:`, error);
      throw error;
    }
  }

  async sendSolicitudAprobadaEmail(data: {
    solicitanteEmail: string;
    solicitanteNombre: string;
    codigoSolicitud: string;
    titulo: string;
    aprobadorNombre: string;
    fechaRespuesta: string;
    comentario?: string;
    solicitudId: string;
  }): Promise<void> {
    try {
      const template = this.loadTemplate('solicitud-aprobada.html');
      const html = this.replaceVariables(template, data);

      await this.transporter.sendMail({
        from: this.configService.get<string>('MAIL_FROM'),
        to: data.solicitanteEmail,
        subject: `✅ Solicitud Aprobada: ${data.codigoSolicitud}`,
        html,
      });

      this.logger.log(`Email de solicitud aprobada enviado a ${data.solicitanteEmail}`);
    } catch (error) {
      this.logger.error(`Error al enviar email de solicitud aprobada:`, error);
      throw error;
    }
  }

  async sendSolicitudRechazadaEmail(data: {
    solicitanteEmail: string;
    solicitanteNombre: string;
    codigoSolicitud: string;
    titulo: string;
    rechazadorNombre: string;
    fechaRespuesta: string;
    comentario: string;
    solicitudId: string;
  }): Promise<void> {
    try {
      const template = this.loadTemplate('solicitud-rechazada.html');
      const html = this.replaceVariables(template, data);

      await this.transporter.sendMail({
        from: this.configService.get<string>('MAIL_FROM'),
        to: data.solicitanteEmail,
        subject: `❌ Solicitud Rechazada: ${data.codigoSolicitud}`,
        html,
      });

      this.logger.log(`Email de solicitud rechazada enviado a ${data.solicitanteEmail}`);
    } catch (error) {
      this.logger.error(`Error al enviar email de solicitud rechazada:`, error);
      throw error;
    }
  }

  private loadTemplate(templateName: string): string {
  const isDevelopment = process.env.NODE_ENV !== 'production';
  
  let templatePath: string;
  
  if (isDevelopment) {
    templatePath = path.join(process.cwd(), 'src', 'modules', 'email', 'templates', templateName);
  } else {
    templatePath = path.join(__dirname, 'templates', templateName);
  }
  
  try {
    return fs.readFileSync(templatePath, 'utf-8');
  } catch (error) {
    this.logger.error(`Error al cargar template ${templateName} desde ${templatePath}:`, error);
    throw error;
  }
}

  private replaceVariables(template: string, variables: Record<string, any>): string {
    let result = template;

    // Reemplazar variables simples {{variable}}
    Object.keys(variables).forEach((key) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(regex, variables[key] || '');
    });

    // Manejar condicionales {{#if variable}}...{{/if}}
    result = result.replace(/{{#if\s+(\w+)}}([\s\S]*?){{\/if}}/g, (match, varName, content) => {
      return variables[varName] ? content : '';
    });

    return result;
  }
}