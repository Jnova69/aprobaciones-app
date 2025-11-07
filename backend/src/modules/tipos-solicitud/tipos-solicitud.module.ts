import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TiposSolicitudService } from './tipos-solicitud.service';
import { TiposSolicitudController } from './tipos-solicitud.controller';
import { TipoSolicitud } from './entities/tipo-solicitud.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TipoSolicitud])],
  controllers: [TiposSolicitudController],
  providers: [TiposSolicitudService],
  exports: [TiposSolicitudService],
})
export class TiposSolicitudModule {}