import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateNotificacionDto {
  @IsUUID('4')
  @IsNotEmpty()
  solicitudId: string;

  @IsUUID('4')
  @IsNotEmpty()
  usuarioId: string;

  @IsString()
  @IsNotEmpty()
  tipo: string;

  @IsString()
  @IsNotEmpty()
  mensaje: string;
}