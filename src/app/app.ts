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
  
  // Variable para mostrar el nombre en el header
  usuarioActual: any = null;

  // Signal compartido con home (y cualquier otro componente)
  menuAbierto = this.ui.menuAbierto;

  // Solo admins ven la opción Usuarios
  esAdmin = computed(() => this.loginService.user()?.role_id === 1);

  ngOnInit() {
    // Cargar datos del usuario para el Header
    this.cargarUsuario();

    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const ruta = event.url;

        this.esLogin = ruta.includes('login') || ruta === '/';
        
        // Cada vez que navegamos, intentamos refrescar el usuario por si acaso
        this.cargarUsuario();

        // Cierra el menú al cambiar de página
        this.ui.cerrarMenu();

        if      (ruta.includes('home'))      this.tituloPagina = 'Home';
        else if (ruta.includes('products'))  this.tituloPagina = 'Productos';
        else if (ruta.includes('users'))     this.tituloPagina = 'Usuarios';
        else if (ruta.includes('dashboard')) this.tituloPagina = 'Dashboard';
        else if (ruta.includes('profile'))   this.tituloPagina = 'Perfil';
      }
    });
  }

  cargarUsuario() {
    const data = localStorage.getItem('usuario');
    if (data) {
      const res = JSON.parse(data);
      // Ajustamos según la estructura que tenga tu respuesta de login
      this.usuarioActual = res.user ? res.user : res;
    }
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
    this.menuUsuarioAbierto = false; // Cierra el dropdown al navegar
  }

  cerrarSesion() {
    // Limpiamos el servicio y el almacenamiento local
    this.loginService.logout();
    localStorage.removeItem('usuario'); 
    localStorage.clear(); 
    
    this.usuarioActual = null;
    this.menuUsuarioAbierto = false;
    
    this.router.navigate(['/login']);
  }
}