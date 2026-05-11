import { Routes } from '@angular/router';

import { authGuard } from './guards/auth.guards';


export const routes: Routes = [

{

path: '',

redirectTo: 'login',

pathMatch: 'full'

},

{

path: 'login',

loadComponent: () => import('./features/login/login').then(m => m.Login)

},

{

path: 'home',

canActivate: [authGuard],

loadComponent: () => import('./features/home/home').then(m => m.Home)

},

{

path: 'products', // Esta es tu lista de productos

canActivate: [authGuard],

loadComponent: () => import('./features/products/products').then(m => m.Products)

},

{

// ESTA ES LA NUEVA RUTA PARA EL DETALLE

path: 'producto/:id',

canActivate: [authGuard],

loadComponent: () => import('./features/products/product-detail').then(m => m.ProductDetail)

},

{

path: 'dashboard',

canActivate: [authGuard],

loadComponent: () => import('./features/dashboard/dashboard').then(m => m.Dashboard)

},

{

path: 'users',

canActivate: [authGuard],

loadComponent: () => import('./features/users/users').then(m => m.Users)

},


{
  path: 'foro',
  canActivate: [authGuard],
  loadComponent: () => import('./features/foro/foro').then(m => m.Foro)
},

{
  path: 'profile',
  loadComponent: () =>
    import('./features/Profile/profile')
      .then(m => m.Profile)
}

];