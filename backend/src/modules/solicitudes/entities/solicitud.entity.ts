import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Usuario } from '../../usuarios/entities/usuario.entity';
import { TipoSolicitud } from '../../tipos-solicitud/entities/tipo-solicitud.entity';
import { HistorialSolicitud } from '../../historial/entities/historial-solicitud.entity';
import { Comentario } from './comentario.entity';
import { Notificacion } from '../../notificaciones/entities/notificacion.entity';

export enum EstadoSolicitud {
  PENDIENTE = 'PENDIENTE',
  APROBADO = 'APROBADO',
  RECHAZADO = 'RECHAZADO',
}

@Entity('solicitudes')
export class Solicitud {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 20, unique: true, name: 'codigo_solicitud' })
  codigoSolicitud: string;

  @Column({ type: 'varchar', length: 255 })
  titulo: string;

  @Column({ type: 'text' })
  descripcion: string;

  @Column({ type: 'uuid', name: 'tipo_solicitud_id' })
  tipoSolicitudId: string;

  @Column({ type: 'uuid', name: 'solicitante_id' })
  solicitanteId: string;

  @Column({ type: 'uuid', name: 'responsable_id' })
  responsableId: string;

  @Column({
    type: 'varchar',
    length: 50,
    default: EstadoSolicitud.PENDIENTE,
  })
  estado: EstadoSolicitud;

  @CreateDateColumn({ name: 'fecha_solicitud' })
  fechaSolicitud: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'fecha_respuesta' })
  fechaRespuesta: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relaciones
  @ManyToOne(() => TipoSolicitud, (tipo) => tipo.solicitudes)
  @JoinColumn({ name: 'tipo_solicitud_id' })
  tipoSolicitud: TipoSolicitud;

  @ManyToOne(() => Usuario, (usuario) => usuario.solicitudesCreadas)
  @JoinColumn({ name: 'solicitante_id' })
  solicitante: Usuario;

  @ManyToOne(() => Usuario, (usuario) => usuario.solicitudesAsignadas)
  @JoinColumn({ name: 'responsable_id' })
  responsable: Usuario;

  @OneToMany(() => HistorialSolicitud, (historial) => historial.solicitud)
  historial: HistorialSolicitud[];

  @OneToMany(() => Comentario, (comentario) => comentario.solicitud)
  comentarios: Comentario[];

  @OneToMany(() => Notificacion, (notificacion) => notificacion.solicitud)
  notificaciones: Notificacion[];
}