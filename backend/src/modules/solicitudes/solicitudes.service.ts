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
  ) {}

  async create(createSolicitudDto: CreateSolicitudDto): Promise<Solicitud> {
    // Validar que existan los usuarios y tipo de solicitud
    await this.usuariosService.findOne(createSolicitudDto.solicitanteId);
    await this.usuariosService.findOne(createSolicitudDto.responsableId);
    await this.tiposSolicitudService.findOne(createSolicitudDto.tipoSolicitudId);

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

    // Emitir evento para notificación (Patrón Observer)
    this.eventEmitter.emit('solicitud.creada', {
      solicitudId: solicitudGuardada.id,
      responsableId: createSolicitudDto.responsableId,
      titulo: createSolicitudDto.titulo,
    });

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
}