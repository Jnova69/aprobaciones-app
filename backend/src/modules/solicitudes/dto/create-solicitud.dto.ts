import { IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateSolicitudDto {
  @IsString()
  @IsNotEmpty({ message: 'El título es obligatorio' })
  @MaxLength(255)
  titulo: string;

  @IsString()
  @IsNotEmpty({ message: 'La descripción es obligatoria' })
  descripcion: string;

  @IsUUID('4', { message: 'El tipo de solicitud debe ser un UUID válido' })
  @IsNotEmpty({ message: 'El tipo de solicitud es obligatorio' })
  tipoSolicitudId: string;

  @IsUUID('4', { message: 'El solicitante debe ser un UUID válido' })
  @IsNotEmpty({ message: 'El solicitante es obligatorio' })
  solicitanteId: string;

  @IsUUID('4', { message: 'El responsable debe ser un UUID válido' })
  @IsNotEmpty({ message: 'El responsable es obligatorio' })
  responsableId: string;
}