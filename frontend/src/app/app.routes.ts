import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { MainLayout } from './layout/main-layout/main-layout';
import { Dashboard } from './pages/dashboard/dashboard';
import { Products } from './pages/products/products';
import { authGuard, publicGuard } from './auth.guard';

export const routes: Routes = [
  { path: 'login', component: Login, canActivate: [publicGuard] },
  { path: 'register', component: Register, canActivate: [publicGuard] },
  {
    path: '',
    component: MainLayout,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: Dashboard },
      { path: 'products', component: Products },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: '/login' }
];
