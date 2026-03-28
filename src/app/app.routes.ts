import { Routes } from '@angular/router';
import { MainLayoutComponent } from './core/layout/main-layout.component';
import { HomeComponent } from './features/home/home.component';
import { AboutComponent } from './features/about/about.component';
import { HistoryComponent } from './features/history/history.component';
import { ServicesComponent } from './features/services/services.component';
import { ExperienceComponent } from './features/experience/experience.component';
import { ContactComponent } from './features/contact/contact.component';
import { LoginComponent } from './features/login/login.component';
import { RegisterComponent } from './features/register/register.component';
import { NotFoundComponent } from './features/not-found/not-found.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', component: HomeComponent, title: 'Inicio | JamiEnvios' },
      { path: 'nosotros', component: AboutComponent, title: 'Nosotros | JamiEnvios' },
      { path: 'historia', component: HistoryComponent, title: 'Historia | JamiEnvios' },
      { path: 'servicios', component: ServicesComponent, title: 'Servicios | JamiEnvios' },
      { path: 'experiencia', component: ExperienceComponent, title: 'Experiencia | JamiEnvios' },
      { path: 'contacto', component: ContactComponent, title: 'Contacto | JamiEnvios' },
      { path: 'login', component: LoginComponent, title: 'Iniciar sesión | JamiEnvios' },
      { path: 'registro', component: RegisterComponent, title: 'Registrarse | JamiEnvios' }
    ]
  },
  { path: '**', component: NotFoundComponent, title: 'Página no encontrada | JamiEnvios' }
];

export const appRoutes = routes;