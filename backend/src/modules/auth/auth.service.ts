import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsuariosService } from '../usuarios/usuarios.service';
import { RegisterDto } from './dto/register.dto';
import { EmailService } from '../email/email.service'; 
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { Usuario, UserRole } from '../usuarios/entities/usuario.entity';

@Injectable()
export class AuthService {
  constructor(
    private usuariosService: UsuariosService,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  async register(registerDto: RegisterDto): Promise<{ user: Partial<Usuario>; token: string }> {
    // Verificar si el email ya existe
    try {
      const existingUser = await this.usuariosService.findByEmail(registerDto.email);
      if (existingUser) {
        throw new ConflictException('El email ya está registrado');
      }
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
    }

    // Verificar si el usuario de red ya existe
    try {
      const existingUsuarioRed = await this.usuariosService.findByUsuarioRed(registerDto.usuarioRed);
      if (existingUsuarioRed) {
        throw new ConflictException('El usuario de red ya está registrado');
      }
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
    }

    // Hashear password
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Crear usuario
    const newUser = await this.usuariosService.create({
      ...registerDto,
      password: hashedPassword,
    });

    // Generar token
    const token = this.generateToken(newUser);

    // Crear objeto sin password
    const { password, ...userWithoutPassword } = newUser;

  try {
      await this.emailService.sendWelcomeEmail({
        email: newUser.email,
        nombreCompleto: newUser.nombreCompleto,
        usuarioRed: newUser.usuarioRed,
        rol: newUser.rol,
        area: newUser.area || 'No especificada',
      });
    } catch (error) {
      // Log pero no falla el registro si el email falla
      console.error('Error al enviar email de bienvenida:', error);
    }

    return { user: userWithoutPassword, token };
    
  }

  async login(loginDto: LoginDto): Promise<{ user: Partial<Usuario>; token: string }> {
    // Buscar usuario por email
    const user = await this.usuariosService.findByEmail(loginDto.email);
    
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Verificar que esté activo
    if (!user.activo) {
      throw new UnauthorizedException('Usuario inactivo');
    }

    // Verificar password
    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Generar token
    const token = this.generateToken(user);

    // Crear objeto sin password
    const { password, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, token };
    
  }
  

  async validateUser(userId: string): Promise<Partial<Usuario>> {
    const user = await this.usuariosService.findOne(userId);
    if (!user || !user.activo) {
      throw new UnauthorizedException('Usuario no autorizado');
    }
    
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  private generateToken(user: Usuario): string {
    const payload = {
      sub: user.id,
      email: user.email,
      rol: user.rol,
      usuarioRed: user.usuarioRed,
    };

    return this.jwtService.sign(payload);
  }

  async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void> {
    const user = await this.usuariosService.findOne(userId);
    
    // Verificar password anterior
    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Contraseña actual incorrecta');
    }

    // Hashear nueva password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Actualizar password
    await this.usuariosService.update(userId, { password: hashedPassword });
  }
}