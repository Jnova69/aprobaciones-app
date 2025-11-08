import { Controller, Get, Post, Body, Patch, Param, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { SolicitudesService } from './solicitudes.service';
import { CreateSolicitudDto } from './dto/create-solicitud.dto';
import { UpdateSolicitudDto } from './dto/update-solicitud.dto';
import { AprobarSolicitudDto } from './dto/aprobar-solicitud.dto';
import { RechazarSolicitudDto } from './dto/rechazar-solicitud.dto';
import { CreateComentarioDto } from './dto/create-comentario.dto';
import { EstadoSolicitud } from './entities/solicitud.entity';

@Controller('solicitudes')
export class SolicitudesController {
  constructor(private readonly solicitudesService: SolicitudesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createSolicitudDto: CreateSolicitudDto) {
    return this.solicitudesService.create(createSolicitudDto);
  }

  @Get()
  findAll(@Query('estado') estado?: EstadoSolicitud) {
    if (estado) {
      return this.solicitudesService.findByEstado(estado);
    }
    return this.solicitudesService.findAll();
  }

  @Get('responsable/:responsableId')
  findByResponsable(@Param('responsableId') responsableId: string) {
    return this.solicitudesService.findByResponsable(responsableId);
  }

  @Get('solicitante/:solicitanteId')
  findBySolicitante(@Param('solicitanteId') solicitanteId: string) {
    return this.solicitudesService.findBySolicitante(solicitanteId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.solicitudesService.findOne(id);
  }

  @Get(':id/historial')
  getHistorial(@Param('id') id: string) {
    return this.solicitudesService.getHistorial(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSolicitudDto: UpdateSolicitudDto) {
    return this.solicitudesService.update(id, updateSolicitudDto);
  }

  @Post(':id/aprobar')
  @HttpCode(HttpStatus.OK)
  aprobar(@Param('id') id: string, @Body() aprobarDto: AprobarSolicitudDto) {
    return this.solicitudesService.aprobar(id, aprobarDto);
  }

  @Post(':id/rechazar')
  @HttpCode(HttpStatus.OK)
  rechazar(@Param('id') id: string, @Body() rechazarDto: RechazarSolicitudDto) {
    return this.solicitudesService.rechazar(id, rechazarDto);
  }

  @Post('comentarios')
  @HttpCode(HttpStatus.CREATED)
  addComentario(@Body() createComentarioDto: CreateComentarioDto) {
    return this.solicitudesService.addComentario(createComentarioDto);
  }
}