import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { UsuariosModule } from './modules/usuarios/usuarios.module';
import { TiposSolicitudModule } from './modules/tipos-solicitud/tipos-solicitud.module';
import { SolicitudesModule } from './modules/solicitudes/solicitudes.module';
import { HistorialModule } from './modules/historial/historial.module';
import { NotificacionesModule } from './modules/notificaciones/notificaciones.module';
import { AuthModule } from './modules/auth/auth.module';
import { EmailModule } from './modules/email/email.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get<string>('DB_USERNAME', 'admin'),
        password: configService.get<string>('DB_PASSWORD', 'admin123'),
        database: configService.get<string>('DB_DATABASE', 'aprobaciones_db'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: false,
        logging: true,
      }),
    }),
    EventEmitterModule.forRoot(),
    AuthModule,
    UsuariosModule,
    TiposSolicitudModule,
    SolicitudesModule,
    HistorialModule,
    NotificacionesModule,
    EmailModule,
  ],
})
export class AppModule {}