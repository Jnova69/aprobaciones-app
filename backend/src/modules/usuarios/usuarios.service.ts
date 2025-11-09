import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from './entities/usuario.entity';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { UserRole } from './entities/usuario.entity';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {}

  async create(createUsuarioDto: CreateUsuarioDto): Promise<Usuario> {
    const usuario = this.usuarioRepository.create(createUsuarioDto);
    return await this.usuarioRepository.save(usuario);
  }

  async findAll(): Promise<Partial<Usuario>[]> {
    return await this.usuarioRepository.find({
      where: { activo: true },
      order: { nombreCompleto: 'ASC' },
      select: ['id', 'usuarioRed', 'nombreCompleto', 'email', 'area', 'rol', 'activo', 'createdAt'],
    });
  }

  async findOne(id: string): Promise<Usuario> {
    const usuario = await this.usuarioRepository.findOne({ where: { id } });
    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }
    return usuario;
  }

  async findByUsuarioRed(usuarioRed: string): Promise<Usuario> {
    const usuario = await this.usuarioRepository.findOne({ where: { usuarioRed } });
    if (!usuario) {
      throw new NotFoundException(`Usuario ${usuarioRed} no encontrado`);
    }
    return usuario;
  }

  async findByEmail(email: string): Promise<Usuario> {
    const usuario = await this.usuarioRepository.findOne({ where: { email } });
    if (!usuario) {
      throw new NotFoundException(`Usuario con email ${email} no encontrado`);
    }
    return usuario;
  }

  async findAdmins(): Promise<Partial<Usuario>[]> {
    return await this.usuarioRepository.find({
      where: { rol: UserRole.ADMIN, activo: true },
      select: ['id', 'usuarioRed', 'nombreCompleto', 'email', 'area', 'rol', 'activo', 'createdAt'],
    });
  }

  async update(id: string, updateUsuarioDto: UpdateUsuarioDto): Promise<Usuario> {
    const usuario = await this.findOne(id);
    Object.assign(usuario, updateUsuarioDto);
    return await this.usuarioRepository.save(usuario);
  }

  async remove(id: string): Promise<void> {
    const usuario = await this.findOne(id);
    usuario.activo = false;
    await this.usuarioRepository.save(usuario);
  }
}