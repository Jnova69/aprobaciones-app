import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsuariosService } from '../../usuarios/usuarios.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private usuariosService: UsuariosService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'tu-secreto-super-seguro-cambiar-en-produccion',
    });
  }

  async validate(payload: any) {
    const user = await this.usuariosService.findOne(payload.sub);
    if (!user || !user.activo) {
      throw new UnauthorizedException('Usuario no autorizado');
    }
    return { userId: payload.sub, email: payload.email, rol: payload.rol };
  }
}