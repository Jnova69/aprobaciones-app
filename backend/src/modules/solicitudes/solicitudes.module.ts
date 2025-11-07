import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SolicitudesService } from './solicitudes.service';
import { SolicitudesController } from './solicitudes.controller';
import { Solicitud } from './entities/solicitud.entity';
import { Comentario } from './entities/comentario.entity';
import { HistorialModule } from '../historial/historial.module';
import { NotificacionesModule } from '../notificaciones/notificaciones.module';
import { UsuariosModule } from '../usuarios/usuarios.module';
import { TiposSolicitudModule } from '../tipos-solicitud/tipos-solicitud.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Solicitud, Comentario]),
    HistorialModule,
    NotificacionesModule,
    UsuariosModule,
    TiposSolicitudModule,
  ],
  controllers: [SolicitudesController],
  providers: [SolicitudesService],
  exports: [SolicitudesService],
})
export class SolicitudesModule {}