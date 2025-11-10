import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  HttpCode, 
  HttpStatus, 
  Query, 
  UseGuards, 
  Request,
  ForbiddenException 
} from '@nestjs/common';
import { SolicitudesService } from './solicitudes.service';
import { CreateSolicitudDto } from './dto/create-solicitud.dto';
import { UpdateSolicitudDto } from './dto/update-solicitud.dto';
import { AprobarSolicitudDto } from './dto/aprobar-solicitud.dto';
import { RechazarSolicitudDto } from './dto/rechazar-solicitud.dto';
import { CreateComentarioDto } from './dto/create-comentario.dto';
import { EstadoSolicitud } from './entities/solicitud.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../usuarios/entities/usuario.entity';

@Controller('solicitudes')
@UseGuards(JwtAuthGuard)
export class SolicitudesController {
  constructor(private readonly solicitudesService: SolicitudesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createSolicitudDto: CreateSolicitudDto, @Request() req) {
    // Validar que el solicitante sea el usuario actual (excepto admins)
    if (req.user.rol !== UserRole.ADMIN && createSolicitudDto.solicitanteId !== req.user.userId) {
      throw new ForbiddenException('No puedes crear solicitudes a nombre de otros usuarios');
    }
    return this.solicitudesService.create(createSolicitudDto);
  }

  @Get()
  findAll(@Query('estado') estado?: EstadoSolicitud, @Request() req?) {
    // Si es admin, ver todas
    if (req.user.rol === UserRole.ADMIN) {
      if (estado) {
        return this.solicitudesService.findByEstado(estado);
      }
      return this.solicitudesService.findAll();
    }
    
    // Si es user, solo ver las suyas
    return this.solicitudesService.findBySolicitante(req.user.userId);
  }

  @Get('responsable/:responsableId')
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  findByResponsable(@Param('responsableId') responsableId: string) {
    return this.solicitudesService.findByResponsable(responsableId);
  }

  @Get('solicitante/:solicitanteId')
  findBySolicitante(@Param('solicitanteId') solicitanteId: string, @Request() req) {
    // Solo puede ver sus propias solicitudes (excepto admins)
    if (req.user.rol !== UserRole.ADMIN && solicitanteId !== req.user.userId) {
      throw new ForbiddenException('No puedes ver solicitudes de otros usuarios');
    }
    return this.solicitudesService.findBySolicitante(solicitanteId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.solicitudesService.findOneWithAccess(id, req.user.userId, req.user.rol);
  }

  @Get(':id/historial')
  getHistorial(@Param('id') id: string, @Request() req) {
    return this.solicitudesService.getHistorialWithAccess(id, req.user.userId, req.user.rol);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSolicitudDto: UpdateSolicitudDto, @Request() req) {
    return this.solicitudesService.updateWithAccess(id, updateSolicitudDto, req.user.userId, req.user.rol);
  }

  @Post(':id/aprobar')
@HttpCode(HttpStatus.OK)
@Roles(UserRole.ADMIN)
@UseGuards(RolesGuard)
aprobar(@Param('id') id: string, @Body() aprobarDto: AprobarSolicitudDto, @Request() req) {
  // IMPORTANTE: Usar el userId del token JWT, no del body
  return this.solicitudesService.aprobar(id, { 
    ...aprobarDto, 
    usuarioId: req.user.userId  // ← Se sobrescribe con el del token
  });
}

@Post(':id/rechazar')
@HttpCode(HttpStatus.OK)
@Roles(UserRole.ADMIN)
@UseGuards(RolesGuard)
rechazar(@Param('id') id: string, @Body() rechazarDto: RechazarSolicitudDto, @Request() req) {
  // IMPORTANTE: Usar el userId del token JWT, no del body
  return this.solicitudesService.rechazar(id, { 
    ...rechazarDto, 
    usuarioId: req.user.userId  // ← Se sobrescribe con el del token
  });
}

  @Post('comentarios')
  @HttpCode(HttpStatus.CREATED)
  addComentario(@Body() createComentarioDto: CreateComentarioDto) {
    return this.solicitudesService.addComentario(createComentarioDto);
  }
}