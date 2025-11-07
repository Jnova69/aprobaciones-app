import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HistorialSolicitud } from './entities/historial-solicitud.entity';
import { CreateHistorialDto } from './dto/create-historial.dto';

@Injectable()
export class HistorialService {
  constructor(
    @InjectRepository(HistorialSolicitud)
    private readonly historialRepository: Repository<HistorialSolicitud>,
  ) {}

  async create(createHistorialDto: CreateHistorialDto): Promise<HistorialSolicitud> {
    const historial = this.historialRepository.create(createHistorialDto);
    return await this.historialRepository.save(historial);
  }

  async findBySolicitud(solicitudId: string): Promise<HistorialSolicitud[]> {
    return await this.historialRepository.find({
      where: { solicitudId },
      relations: ['usuario'],
      order: { fechaAccion: 'DESC' },
    });
  }
}