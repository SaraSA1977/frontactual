// src/app/app.ts

import { Component, OnInit, computed, inject } from '@angular/core';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LoginService } from './service/loginService/loginService';
import { UiService } from './service/uiService/uiService';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class AppComponent implements OnInit {

  private router       = inject(Router);
  private loginService = inject(LoginService);
  private ui           = inject(UiService);

  menuUsuarioAbierto = false;
  tituloPagina       = 'Home';
  esLogin            = false;

  // Signal compartido con home (y cualquier otro componente)
  menuAbierto = this.ui.menuAbierto;

  // Solo admins ven la opción Usuarios
  esAdmin = computed(() => this.loginService.user()?.role_id === 1);

  ngOnInit() {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const ruta = event.url;

        this.esLogin = ruta.includes('login') || ruta === '/';

        // Cierra el menú al cambiar de página
        this.ui.cerrarMenu();

        if      (ruta.includes('home'))      this.tituloPagina = 'Home';
        else if (ruta.includes('products'))  this.tituloPagina = 'Productos';
        else if (ruta.includes('users'))     this.tituloPagina = 'Usuarios';
        else if (ruta.includes('dashboard')) this.tituloPagina = 'Dashboard';
      }
    });
  }

  toggleMenu() {
    this.ui.toggleMenu();
  }

  toggleUserMenu() {
    this.menuUsuarioAbierto = !this.menuUsuarioAbierto;
  }

  navegar(ruta: string) {
    this.router.navigate([ruta]);
    this.ui.cerrarMenu();
  }

  cerrarSesion() {
    this.loginService.logout();
    this.router.navigate(['/login']);
  }
}