import { Routes } from '@angular/router';
import { Home } from './features/home/home';
import { ListaSolicitudes } from './features/solicitudes/lista-solicitudes/lista-solicitudes';
import { CrearSolicitud } from './features/solicitudes/crear-solicitud/crear-solicitud';
import { DetalleSolicitud } from './features/solicitudes/detalle-solicitud/detalle-solicitud';
import { LoginComponent } from './features/auth/login/login';
import { RegisterComponent } from './features/auth/register/register';
import { authGuard } from './core/guards/auth-guard';
import { adminGuard } from './core/guards/admin-guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  
  // Rutas protegidas
  { 
    path: 'home', 
    component: Home,
    canActivate: [authGuard]
  },
  { 
    path: 'solicitudes', 
    component: ListaSolicitudes,
    canActivate: [authGuard]
  },
  { 
    path: 'solicitudes/nueva', 
    component: CrearSolicitud,
    canActivate: [authGuard]
  },
  { 
    path: 'solicitudes/:id', 
    component: DetalleSolicitud,
    canActivate: [authGuard]
  },
  
  { path: '**', redirectTo: '/login' },
];