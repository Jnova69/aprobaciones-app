import { PartialType } from '@nestjs/mapped-types';
import { CreateTipoSolicitudDto } from './create-tipo-solicitud.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateTipoSolicitudDto extends PartialType(CreateTipoSolicitudDto) {
  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}