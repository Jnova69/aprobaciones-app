import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateHistorialDto {
  @IsUUID('4')
  @IsNotEmpty()
  solicitudId: string;

  @IsUUID('4')
  @IsNotEmpty()
  usuarioId: string;

  @IsString()
  @IsNotEmpty()
  accion: string;

  @IsString()
  @IsOptional()
  estadoAnterior?: string;

  @IsString()
  @IsOptional()
  estadoNuevo?: string;

  @IsString()
  @IsOptional()
  comentario?: string;
}