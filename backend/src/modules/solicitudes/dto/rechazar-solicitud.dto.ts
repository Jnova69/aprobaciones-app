import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class RechazarSolicitudDto {
  @IsUUID('4', { message: 'El ID del usuario debe ser un UUID válido' })
  @IsNotEmpty({ message: 'El usuario que rechaza es obligatorio' })
  usuarioId: string;

  @IsString()
  @IsNotEmpty({ message: 'El motivo de rechazo es obligatorio' })
  comentario: string;
}