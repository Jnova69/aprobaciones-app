import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TipoSolicitud } from './entities/tipo-solicitud.entity';
import { CreateTipoSolicitudDto } from './dto/create-tipo-solicitud.dto';
import { UpdateTipoSolicitudDto } from './dto/update-tipo-solicitud.dto';

@Injectable()
export class TiposSolicitudService {
  constructor(
    @InjectRepository(TipoSolicitud)
    private readonly tipoSolicitudRepository: Repository<TipoSolicitud>,
  ) {}

  async create(createTipoSolicitudDto: CreateTipoSolicitudDto): Promise<TipoSolicitud> {
    const tipoSolicitud = this.tipoSolicitudRepository.create(createTipoSolicitudDto);
    return await this.tipoSolicitudRepository.save(tipoSolicitud);
  }

  async findAll(): Promise<TipoSolicitud[]> {
    return await this.tipoSolicitudRepository.find({
      where: { activo: true },
      order: { nombre: 'ASC' },
    });
  }

  async findOne(id: string): Promise<TipoSolicitud> {
    const tipoSolicitud = await this.tipoSolicitudRepository.findOne({ where: { id } });
    if (!tipoSolicitud) {
      throw new NotFoundException(`Tipo de solicitud con ID ${id} no encontrado`);
    }
    return tipoSolicitud;
  }

  async update(id: string, updateTipoSolicitudDto: UpdateTipoSolicitudDto): Promise<TipoSolicitud> {
    const tipoSolicitud = await this.findOne(id);
    Object.assign(tipoSolicitud, updateTipoSolicitudDto);
    return await this.tipoSolicitudRepository.save(tipoSolicitud);
  }

  async remove(id: string): Promise<void> {
    const tipoSolicitud = await this.findOne(id);
    tipoSolicitud.activo = false;
    await this.tipoSolicitudRepository.save(tipoSolicitud);
  }
}