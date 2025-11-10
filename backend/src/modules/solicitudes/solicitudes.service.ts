import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Solicitud, EstadoSolicitud } from './entities/solicitud.entity';
import { Comentario } from './entities/comentario.entity';
import { CreateSolicitudDto } from './dto/create-solicitud.dto';
import { UpdateSolicitudDto } from './dto/update-solicitud.dto';
import { AprobarSolicitudDto } from './dto/aprobar-solicitud.dto';
import { RechazarSolicitudDto } from './dto/rechazar-solicitud.dto';
import { CreateComentarioDto } from './dto/create-comentario.dto';
import { HistorialService } from '../historial/historial.service';
import { UsuariosService } from '../usuarios/usuarios.service';
import { TiposSolicitudService } from '../tipos-solicitud/tipos-solicitud.service';
import { EmailService } from '../email/email.service';
import { UserRole } from '../usuarios/entities/usuario.entity';

@Injectable()
export class SolicitudesService {
  constructor(
    @InjectRepository(Solicitud)
    private readonly solicitudRepository: Repository<Solicitud>,
    @InjectRepository(Comentario)
    private readonly comentarioRepository: Repository<Comentario>,
    private readonly historialService: HistorialService,
    private readonly usuariosService: UsuariosService,
    private readonly tiposSolicitudService: TiposSolicitudService,
    private readonly eventEmitter: EventEmitter2,
    private readonly emailService: EmailService,  // NUEVO
  ) {}

  async create(createSolicitudDto: CreateSolicitudDto): Promise<Solicitud> {
    // Validar que existan los usuarios y tipo de solicitud
    const solicitante = await this.usuariosService.findOne(createSolicitudDto.solicitanteId);
    const responsable = await this.usuariosService.findOne(createSolicitudDto.responsableId);
    const tipoSolicitud = await this.tiposSolicitudService.findOne(createSolicitudDto.tipoSolicitudId);

    // Generar código único para la solicitud
    const codigoSolicitud = await this.generarCodigoSolicitud();

    const solicitud = this.solicitudRepository.create({
      ...createSolicitudDto,
      codigoSolicitud,
      estado: EstadoSolicitud.PENDIENTE,
    });

    const solicitudGuardada = await this.solicitudRepository.save(solicitud);

    // Registrar en historial
    await this.historialService.create({
      solicitudId: solicitudGuardada.id,
      usuarioId: createSolicitudDto.solicitanteId,
      accion: 'CREADA',
      estadoNuevo: EstadoSolicitud.PENDIENTE,
    });

    // Emitir evento para notificación
    this.eventEmitter.emit('solicitud.creada', {
      solicitudId: solicitudGuardada.id,
      responsableId: createSolicitudDto.responsableId,
      titulo: createSolicitudDto.titulo,
    });

    // 🆕 ENVIAR EMAIL AL RESPONSABLE
    try {
      await this.emailService.sendNewSolicitudEmail({
        responsableEmail: responsable.email,
        responsableNombre: responsable.nombreCompleto,
        codigoSolicitud: solicitudGuardada.codigoSolicitud,
        titulo: solicitudGuardada.titulo,
        tipoSolicitud: tipoSolicitud.nombre,
        solicitanteNombre: solicitante.nombreCompleto,
        solicitanteEmail: solicitante.email,
        fechaSolicitud: solicitudGuardada.fechaSolicitud.toLocaleString('es-CO', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        descripcion: solicitudGuardada.descripcion,
        solicitudId: solicitudGuardada.id,
      });
    } catch (error) {
      console.error('Error al enviar email de nueva solicitud:', error);
      // No falla la creación si el email falla
    }

    return solicitudGuardada;
  }

  async findAll(): Promise<Solicitud[]> {
    return await this.solicitudRepository.find({
      relations: ['solicitante', 'responsable', 'tipoSolicitud'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Solicitud> {
    const solicitud = await this.solicitudRepository.findOne({
      where: { id },
      relations: ['solicitante', 'responsable', 'tipoSolicitud', 'comentarios', 'comentarios.usuario'],
    });

    if (!solicitud) {
      throw new NotFoundException(`Solicitud con ID ${id} no encontrada`);
    }

    return solicitud;
  }

  async findByEstado(estado: EstadoSolicitud): Promise<Solicitud[]> {
    return await this.solicitudRepository.find({
      where: { estado },
      relations: ['solicitante', 'responsable', 'tipoSolicitud'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByResponsable(responsableId: string): Promise<Solicitud[]> {
    return await this.solicitudRepository.find({
      where: { responsableId },
      relations: ['solicitante', 'responsable', 'tipoSolicitud'],
      order: { createdAt: 'DESC' },
    });
  }

  async findBySolicitante(solicitanteId: string): Promise<Solicitud[]> {
    return await this.solicitudRepository.find({
      where: { solicitanteId },
      relations: ['solicitante', 'responsable', 'tipoSolicitud'],
      order: { createdAt: 'DESC' },
    });
  }

  async aprobar(id: string, aprobarDto: AprobarSolicitudDto): Promise<Solicitud> {
    const solicitud = await this.findOne(id);

    if (solicitud.estado !== EstadoSolicitud.PENDIENTE) {
      throw new BadRequestException('Solo se pueden aprobar solicitudes pendientes');
    }

    // Validar que el usuario aprobador sea el responsable
    if (solicitud.responsableId !== aprobarDto.usuarioId) {
      throw new BadRequestException('Solo el responsable asignado puede aprobar esta solicitud');
    }

    const estadoAnterior = solicitud.estado;
    solicitud.estado = EstadoSolicitud.APROBADO;
    solicitud.fechaRespuesta = new Date();

    const solicitudActualizada = await this.solicitudRepository.save(solicitud);

    // Obtener datos del aprobador
    const aprobador = await this.usuariosService.findOne(aprobarDto.usuarioId);

    // Registrar en historial
    await this.historialService.create({
      solicitudId: solicitud.id,
      usuarioId: aprobarDto.usuarioId,
      accion: 'APROBADA',
      estadoAnterior,
      estadoNuevo: EstadoSolicitud.APROBADO,
      comentario: aprobarDto.comentario,
    });

    // Si hay comentario, guardarlo
    if (aprobarDto.comentario) {
      await this.addComentario({
        solicitudId: solicitud.id,
        usuarioId: aprobarDto.usuarioId,
        comentario: aprobarDto.comentario,
      });
    }

    // Emitir evento para notificación
    this.eventEmitter.emit('solicitud.aprobada', {
      solicitudId: solicitud.id,
      solicitanteId: solicitud.solicitanteId,
      titulo: solicitud.titulo,
    });

    // 🆕 ENVIAR EMAIL AL SOLICITANTE
    try {
      await this.emailService.sendSolicitudAprobadaEmail({
        solicitanteEmail: solicitud.solicitante.email,
        solicitanteNombre: solicitud.solicitante.nombreCompleto,
        codigoSolicitud: solicitud.codigoSolicitud,
        titulo: solicitud.titulo,
        aprobadorNombre: aprobador.nombreCompleto,
        fechaRespuesta: solicitud.fechaRespuesta.toLocaleString('es-CO', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        comentario: aprobarDto.comentario,
        solicitudId: solicitud.id,
      });
    } catch (error) {
      console.error('Error al enviar email de solicitud aprobada:', error);
    }

    return solicitudActualizada;
  }

  async rechazar(id: string, rechazarDto: RechazarSolicitudDto): Promise<Solicitud> {
    const solicitud = await this.findOne(id);

    if (solicitud.estado !== EstadoSolicitud.PENDIENTE) {
      throw new BadRequestException('Solo se pueden rechazar solicitudes pendientes');
    }

    // Validar que el usuario sea el responsable
    if (solicitud.responsableId !== rechazarDto.usuarioId) {
      throw new BadRequestException('Solo el responsable asignado puede rechazar esta solicitud');
    }

    const estadoAnterior = solicitud.estado;
    solicitud.estado = EstadoSolicitud.RECHAZADO;
    solicitud.fechaRespuesta = new Date();

    const solicitudActualizada = await this.solicitudRepository.save(solicitud);

    // Obtener datos del rechazador
    const rechazador = await this.usuariosService.findOne(rechazarDto.usuarioId);

    // Registrar en historial
    await this.historialService.create({
      solicitudId: solicitud.id,
      usuarioId: rechazarDto.usuarioId,
      accion: 'RECHAZADA',
      estadoAnterior,
      estadoNuevo: EstadoSolicitud.RECHAZADO,
      comentario: rechazarDto.comentario,
    });

    // Guardar comentario obligatorio
    await this.addComentario({
      solicitudId: solicitud.id,
      usuarioId: rechazarDto.usuarioId,
      comentario: rechazarDto.comentario,
    });

    // Emitir evento para notificación
    this.eventEmitter.emit('solicitud.rechazada', {
      solicitudId: solicitud.id,
      solicitanteId: solicitud.solicitanteId,
      titulo: solicitud.titulo,
    });

    // 🆕 ENVIAR EMAIL AL SOLICITANTE
    try {
      await this.emailService.sendSolicitudRechazadaEmail({
        solicitanteEmail: solicitud.solicitante.email,
        solicitanteNombre: solicitud.solicitante.nombreCompleto,
        codigoSolicitud: solicitud.codigoSolicitud,
        titulo: solicitud.titulo,
        rechazadorNombre: rechazador.nombreCompleto,
        fechaRespuesta: solicitud.fechaRespuesta.toLocaleString('es-CO', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        comentario: rechazarDto.comentario,
        solicitudId: solicitud.id,
      });
    } catch (error) {
      console.error('Error al enviar email de solicitud rechazada:', error);
    }

    return solicitudActualizada;
  }

  async addComentario(createComentarioDto: CreateComentarioDto): Promise<Comentario> {
    const comentario = this.comentarioRepository.create(createComentarioDto);
    return await this.comentarioRepository.save(comentario);
  }

  async getHistorial(solicitudId: string) {
    await this.findOne(solicitudId); // Validar que existe
    return await this.historialService.findBySolicitud(solicitudId);
  }

  async update(id: string, updateSolicitudDto: UpdateSolicitudDto): Promise<Solicitud> {
    const solicitud = await this.findOne(id);

    if (solicitud.estado !== EstadoSolicitud.PENDIENTE) {
      throw new BadRequestException('Solo se pueden editar solicitudes pendientes');
    }

    Object.assign(solicitud, updateSolicitudDto);
    return await this.solicitudRepository.save(solicitud);
  }

  private async generarCodigoSolicitud(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.solicitudRepository.count();
    const numero = String(count + 1).padStart(4, '0');
    return `SOL-${year}-${numero}`;
  }

async findOneWithAccess(id: string, userId: string, rol: UserRole): Promise<Solicitud> {
  const solicitud = await this.findOne(id);
  
  // Admin puede ver todas
  if (rol === UserRole.ADMIN) {
    return solicitud;
  }
  
  // User solo puede ver si es solicitante o responsable
  if (solicitud.solicitanteId !== userId && solicitud.responsableId !== userId) {
    throw new BadRequestException('No tienes permiso para ver esta solicitud');
  }
  
  return solicitud;
}

async getHistorialWithAccess(solicitudId: string, userId: string, rol: UserRole) {
  const solicitud = await this.findOne(solicitudId);
  
  // Admin puede ver todo
  if (rol === UserRole.ADMIN) {
    return await this.historialService.findBySolicitud(solicitudId);
  }
  
  // User solo puede ver si es solicitante o responsable
  if (solicitud.solicitanteId !== userId && solicitud.responsableId !== userId) {
    throw new BadRequestException('No tienes permiso para ver el historial de esta solicitud');
  }
  
  return await this.historialService.findBySolicitud(solicitudId);
}

async updateWithAccess(id: string, updateSolicitudDto: UpdateSolicitudDto, userId: string, rol: UserRole): Promise<Solicitud> {
  const solicitud = await this.findOne(id);
  
  // Solo el solicitante puede editar (si está pendiente)
  if (solicitud.solicitanteId !== userId && rol !== UserRole.ADMIN) {
    throw new BadRequestException('Solo el solicitante puede editar la solicitud');
  }
  
  return await this.update(id, updateSolicitudDto);
}
}