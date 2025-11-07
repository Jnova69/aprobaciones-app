import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateTipoSolicitudDto {
  @IsString()
  @IsNotEmpty({ message: 'El código es obligatorio' })
  @MaxLength(50)
  codigo: string;

  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @MaxLength(100)
  nombre: string;

  @IsString()
  @IsOptional()
  descripcion?: string;
}