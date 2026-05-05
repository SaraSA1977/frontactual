// src/app/features/home/home.ts

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UiService } from '../../service/uiService/uiService';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home {

  private ui = inject(UiService);

  // Al hacer clic en "Ir al menú" abre el sidebar
  // sin necesidad de navegar a otra página
  irAlMenu() {
    this.ui.abrirMenu();
  }
}

  



