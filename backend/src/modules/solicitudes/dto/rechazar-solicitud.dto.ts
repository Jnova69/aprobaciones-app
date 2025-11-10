import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class RechazarSolicitudDto {
  @IsUUID('4', { message: 'El ID del usuario debe ser un UUID válido' })
  @IsOptional()  // Ahora es opcional porque viene del token
  usuarioId?: string;

  @IsString()
  @IsNotEmpty({ message: 'El motivo de rechazo es obligatorio' })
  comentario: string;
}