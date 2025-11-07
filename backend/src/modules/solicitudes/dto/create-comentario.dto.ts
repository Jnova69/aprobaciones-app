import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateComentarioDto {
  @IsUUID('4', { message: 'El ID de la solicitud debe ser un UUID válido' })
  @IsNotEmpty({ message: 'La solicitud es obligatoria' })
  solicitudId: string;

  @IsUUID('4', { message: 'El ID del usuario debe ser un UUID válido' })
  @IsNotEmpty({ message: 'El usuario es obligatorio' })
  usuarioId: string;

  @IsString()
  @IsNotEmpty({ message: 'El comentario es obligatorio' })
  comentario: string;
}