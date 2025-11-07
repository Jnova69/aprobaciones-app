import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Solicitud } from './solicitud.entity';
import { Usuario } from '../../usuarios/entities/usuario.entity';

@Entity('comentarios')
export class Comentario {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'solicitud_id' })
  solicitudId: string;

  @Column({ type: 'uuid', name: 'usuario_id' })
  usuarioId: string;

  @Column({ type: 'text' })
  comentario: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Solicitud, (solicitud) => solicitud.comentarios)
  @JoinColumn({ name: 'solicitud_id' })
  solicitud: Solicitud;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;
}