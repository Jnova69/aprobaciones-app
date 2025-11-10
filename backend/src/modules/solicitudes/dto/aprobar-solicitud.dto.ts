import { IsOptional, IsString, IsUUID } from 'class-validator';

export class AprobarSolicitudDto {
  @IsUUID('4', { message: 'El ID del usuario debe ser un UUID válido' })
  @IsOptional()  // Ahora es opcional porque viene del token
  usuarioId?: string;

  @IsString()
  @IsOptional()
  comentario?: string;
}