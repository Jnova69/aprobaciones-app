import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { TiposSolicitudService } from './tipos-solicitud.service';
import { CreateTipoSolicitudDto } from './dto/create-tipo-solicitud.dto';
import { UpdateTipoSolicitudDto } from './dto/update-tipo-solicitud.dto';

@Controller('tipos-solicitud')
export class TiposSolicitudController {
  constructor(private readonly tiposSolicitudService: TiposSolicitudService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createTipoSolicitudDto: CreateTipoSolicitudDto) {
    return this.tiposSolicitudService.create(createTipoSolicitudDto);
  }

  @Get()
  findAll() {
    return this.tiposSolicitudService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tiposSolicitudService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTipoSolicitudDto: UpdateTipoSolicitudDto) {
    return this.tiposSolicitudService.update(id, updateTipoSolicitudDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.tiposSolicitudService.remove(id);
  }
}