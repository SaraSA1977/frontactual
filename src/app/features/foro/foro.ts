// src/app/features/foro/foro.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ForoService } from '../../service/foroService/foroService';
import { LoginService } from '../../service/loginService/loginService';

@Component({
  selector: 'app-foro',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './foro.html',
  styleUrl: './foro.scss'
})
export class Foro implements OnInit {

  preguntas: any[]  = [];
  cargando          = false;
  mostrarFormulario = false;
  publicando        = false;

  nuevaTitulo               = '';
  nuevoCuerpo               = '';
  imagenPreview: string | null = null;
  imagenBase64:  string | null = null;
  imagenModal:   string | null = null;

  constructor(
    private foroService: ForoService,
    private loginService: LoginService
  ) {}

  ngOnInit() {
    this.cargarPreguntas();
  }

  cargarPreguntas() {
    this.cargando = true;
    this.foroService.getAllPreguntas().subscribe({
      next: (preguntas) => {
        this.preguntas = preguntas.map(p => ({
          ...p,
          mostrarRespuestas: false,
          nuevaRespuesta:    '',
          imagenRespBase64:  null,
          imagenRespPreview: null,
        }));
        this.cargando = false;
      },
      error: () => { this.cargando = false; }
    });
  }

  abrirFormulario()    { this.mostrarFormulario = true; }

  cancelarFormulario() {
    this.mostrarFormulario = false;
    this.nuevaTitulo       = '';
    this.nuevoCuerpo       = '';
    this.imagenPreview     = null;
    this.imagenBase64      = null;
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.imagenPreview = e.target.result;
      this.imagenBase64  = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  onFileSelectedResp(event: any, pregunta: any) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e: any) => {
      pregunta.imagenRespPreview = e.target.result;
      pregunta.imagenRespBase64  = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  publicarPregunta() {
    if (!this.nuevaTitulo.trim() || !this.nuevoCuerpo.trim()) return;
    this.publicando = true;

    this.foroService.createPregunta({
      titulo: this.nuevaTitulo,
      cuerpo: this.nuevoCuerpo,
      imagen: this.imagenBase64 || null,
    }).subscribe({
      next: (nueva) => {
        this.preguntas.unshift({
          ...nueva,
          mostrarRespuestas: false,
          nuevaRespuesta:    '',
          imagenRespBase64:  null,
          imagenRespPreview: null,
        });
        this.publicando = false;
        this.cancelarFormulario();
      },
      error: () => { this.publicando = false; }
    });
  }

  toggleRespuestas(pregunta: any) {
    pregunta.mostrarRespuestas = !pregunta.mostrarRespuestas;
  }

  responder(pregunta: any) {
    if (!pregunta.nuevaRespuesta?.trim()) return;

    this.foroService.createRespuesta({
      cuerpo:      pregunta.nuevaRespuesta,
      pregunta_id: pregunta.id,
      imagen:      pregunta.imagenRespBase64 || null,
    }).subscribe({
      next: (resp) => {
        if (!pregunta.respuestas) pregunta.respuestas = [];
        pregunta.respuestas.push(resp);
        pregunta.nuevaRespuesta    = '';
        pregunta.imagenRespBase64  = null;
        pregunta.imagenRespPreview = null;
      }
    });
  }

  cerrarPregunta(pregunta: any) {
    this.foroService.closePregunta(pregunta.id).subscribe({
      next: () => { pregunta.cerrada = true; }
    });
  }

  eliminarPregunta(id: number) {
    if (!confirm('¿Seguro que deseas eliminar esta pregunta?')) return;
    this.foroService.deletePregunta(id).subscribe({
      next: () => {
        this.preguntas = this.preguntas.filter(p => p.id !== id);
      }
    });
  }

  eliminarRespuesta(id: number, pregunta: any) {
    if (!confirm('¿Eliminar esta respuesta?')) return;
    this.foroService.deleteRespuesta(id).subscribe({
      next: () => {
        pregunta.respuestas = pregunta.respuestas.filter((r: any) => r.id !== id);
      }
    });
  }

  verImagen(url: string)   { this.imagenModal = url; }
  esMiPregunta(id_autor: number) { return this.loginService.user()?.id === id_autor; }
  puedeEliminar(id_autor: number) {
    const user = this.loginService.user();
    return user?.id === id_autor || user?.role_id === 1;
  }
}