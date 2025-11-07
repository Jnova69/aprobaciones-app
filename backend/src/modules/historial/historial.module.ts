import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HistorialService } from './historial.service';
import { HistorialSolicitud } from './entities/historial-solicitud.entity';

@Module({
  imports: [TypeOrmModule.forFeature([HistorialSolicitud])],
  providers: [HistorialService],
  exports: [HistorialService],
})
export class HistorialModule {}