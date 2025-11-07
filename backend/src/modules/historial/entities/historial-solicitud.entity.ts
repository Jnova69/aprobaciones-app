import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Solicitud } from '../../solicitudes/entities/solicitud.entity';
import { Usuario } from '../../usuarios/entities/usuario.entity';

@Entity('historial_solicitudes')
export class HistorialSolicitud {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'solicitud_id' })
  solicitudId: string;

  @Column({ type: 'uuid', name: 'usuario_id' })
  usuarioId: string;

  @Column({ type: 'varchar', length: 50 })
  accion: string;

  @Column({ type: 'varchar', length: 50, nullable: true, name: 'estado_anterior' })
  estadoAnterior: string;

  @Column({ type: 'varchar', length: 50, nullable: true, name: 'estado_nuevo' })
  estadoNuevo: string;

  @Column({ type: 'text', nullable: true })
  comentario: string;

  @CreateDateColumn({ name: 'fecha_accion' })
  fechaAccion: Date;

  @ManyToOne(() => Solicitud, (solicitud) => solicitud.historial)
  @JoinColumn({ name: 'solicitud_id' })
  solicitud: Solicitud;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;
}