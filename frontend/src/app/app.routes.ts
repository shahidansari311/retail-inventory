import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { NotFound } from './pages/not-found/not-found';
import { MainLayout } from './layout/main-layout/main-layout';
import { Dashboard } from './pages/dashboard/dashboard';
import { Products } from './pages/products/products';

import { Categories } from './pages/categories/categories';
import { Warehouses } from './pages/warehouses/warehouses';
import { Inventory } from './pages/inventory/inventory';
import { StockMovements } from './pages/stock-movements/stock-movements';
import { Orders } from './pages/orders/orders';
import { Customers } from './pages/customers/customers';
import { Suppliers } from './pages/suppliers/suppliers';
import { PurchaseOrders } from './pages/purchase-orders/purchase-orders';

import { authGuard, publicGuard } from './auth.guard';

export const routes: Routes = [
  { path: 'login',    component: Login,    canActivate: [publicGuard] },
  { path: 'register', component: Register, canActivate: [publicGuard] },
  {
    path: '',
    component: MainLayout,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard',       component: Dashboard },
      { path: 'products',        component: Products },
      { path: 'categories',      component: Categories },
      { path: 'warehouses',      component: Warehouses },
      { path: 'inventory',       component: Inventory },
      { path: 'stock-movements', component: StockMovements },
      { path: 'orders',          component: Orders },
      { path: 'customers',       component: Customers },
      { path: 'suppliers',       component: Suppliers },
      { path: 'purchase-orders', component: PurchaseOrders },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  { path: '404',  component: NotFound },
  { path: '**',   component: NotFound }
];
