// src/app/service/uiService/uiService.ts

import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class UiService {

  // FIX: false = menú cerrado por defecto siempre
  menuAbierto = signal<boolean>(false);

  abrirMenu() {
    this.menuAbierto.set(true);   // usado desde home al dar clic en "Ir al menú"
  }

  cerrarMenu() {
    this.menuAbierto.set(false);  // usado al navegar entre páginas
  }

  toggleMenu() {
    this.menuAbierto.update(v => !v);  // usado por el botón ☰
  }
}