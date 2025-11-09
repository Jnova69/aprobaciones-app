import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { Solicitud } from '../../solicitudes/entities/solicitud.entity';
import { Exclude } from 'class-transformer';

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, unique: true, name: 'usuario_red' })
  usuarioRed: string;

  @Column({ type: 'varchar', length: 255, name: 'nombre_completo' })
  nombreCompleto: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  @Exclude() 
  password: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  area: string;

  @Column({ type: 'varchar', length: 50, default: UserRole.USER })
  rol: UserRole;

  @Column({ type: 'boolean', default: true })
  activo: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToMany(() => Solicitud, (solicitud) => solicitud.solicitante)
  solicitudesCreadas: Solicitud[];

  @OneToMany(() => Solicitud, (solicitud) => solicitud.responsable)
  solicitudesAsignadas: Solicitud[];
}