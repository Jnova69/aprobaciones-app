import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class AprobarSolicitudDto {
  @IsUUID('4', { message: 'El ID del usuario debe ser un UUID válido' })
  @IsNotEmpty({ message: 'El usuario aprobador es obligatorio' })
  usuarioId: string;

  @IsString()
  @IsOptional()
  comentario?: string;
}