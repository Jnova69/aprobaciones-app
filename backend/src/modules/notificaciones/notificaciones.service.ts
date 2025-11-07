import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notificacion } from './entities/notificacion.entity';
import { CreateNotificacionDto } from './dto/create-notificacion.dto';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class NotificacionesService {
  constructor(
    @InjectRepository(Notificacion)
    private readonly notificacionRepository: Repository<Notificacion>,
  ) {}

  async create(createNotificacionDto: CreateNotificacionDto): Promise<Notificacion> {
    const notificacion = this.notificacionRepository.create(createNotificacionDto);
    return await this.notificacionRepository.save(notificacion);
  }

  async findByUsuario(usuarioId: string): Promise<Notificacion[]> {
    return await this.notificacionRepository.find({
      where: { usuarioId },
      relations: ['solicitud'],
      order: { createdAt: 'DESC' },
    });
  }

  async findNoLeidas(usuarioId: string): Promise<Notificacion[]> {
    return await this.notificacionRepository.find({
      where: { usuarioId, leida: false },
      relations: ['solicitud'],
      order: { createdAt: 'DESC' },
    });
  }

  async marcarComoLeida(id: string): Promise<void> {
    await this.notificacionRepository.update(id, { leida: true });
  }

  // Patrón Observer: Escuchar eventos
  @OnEvent('solicitud.creada')
  async handleSolicitudCreada(payload: { solicitudId: string; responsableId: string; titulo: string }) {
    await this.create({
      solicitudId: payload.solicitudId,
      usuarioId: payload.responsableId,
      tipo: 'NUEVA_SOLICITUD',
      mensaje: `Tienes una nueva solicitud pendiente: ${payload.titulo}`,
    });
  }

  @OnEvent('solicitud.aprobada')
  async handleSolicitudAprobada(payload: { solicitudId: string; solicitanteId: string; titulo: string }) {
    await this.create({
      solicitudId: payload.solicitudId,
      usuarioId: payload.solicitanteId,
      tipo: 'APROBADA',
      mensaje: `Tu solicitud "${payload.titulo}" ha sido aprobada`,
    });
  }

  @OnEvent('solicitud.rechazada')
  async handleSolicitudRechazada(payload: { solicitudId: string; solicitanteId: string; titulo: string }) {
    await this.create({
      solicitudId: payload.solicitudId,
      usuarioId: payload.solicitanteId,
      tipo: 'RECHAZADA',
      mensaje: `Tu solicitud "${payload.titulo}" ha sido rechazada`,
    });
  }
}