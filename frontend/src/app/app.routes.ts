import { Routes } from '@angular/router';
import { Home } from './features/home/home';
import { ListaSolicitudes } from './features/solicitudes/lista-solicitudes/lista-solicitudes';
import { CrearSolicitud } from './features/solicitudes/crear-solicitud/crear-solicitud';
import { DetalleSolicitud } from './features/solicitudes/detalle-solicitud/detalle-solicitud';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: Home },
  { path: 'solicitudes', component: ListaSolicitudes },
  { path: 'solicitudes/nueva', component: CrearSolicitud },
  { path: 'solicitudes/:id', component: DetalleSolicitud },
  { path: '**', redirectTo: '/home' },
];