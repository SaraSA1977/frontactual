// src/app/features/users/users.ts

import {
  Component,
  signal,
  inject,
  ChangeDetectionStrategy,
  OnInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService, User, CreateUserPayload, UpdateUserPayload } from '../../service/userService/userService';

type ModalMode = 'crear' | 'editar' | null;

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users.html',
  styleUrl: './users.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Users implements OnInit {

  private userService = inject(UserService);

  // ── Estado general ────────────────────────────────────────
  usuarios  = signal<User[]>([]);
  cargando  = signal<boolean>(false);
  error     = signal<string | null>(null);

  // ── Modal ─────────────────────────────────────────────────
  modalMode       = signal<ModalMode>(null);
  modalCargando   = signal<boolean>(false);
  modalError      = signal<string | null>(null);
  usuarioEditando = signal<User | null>(null);

  // ── Formulario ────────────────────────────────────────────
  form = {
    full_name:      '',
    email:          '',
    identification: '',
    password:       '',
    is_active:      1
  };

  // ── Confirmación de eliminación ───────────────────────────
  usuarioAEliminar = signal<User | null>(null);

  ngOnInit() {
    this.cargarUsuarios();
  }

  // ── Cargar usuarios ───────────────────────────────────────
  cargarUsuarios() {
    this.cargando.set(true);
    this.error.set(null);

    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.usuarios.set(users);
        this.cargando.set(false);
      },
      error: (err) => {
        console.error('[USERS] Error:', err);
        this.error.set('No se pudieron cargar los usuarios.');
        this.cargando.set(false);
      }
    });
  }

  // ── Abrir modal CREAR ─────────────────────────────────────
  abrirCrear() {
    this.form = { full_name: '', email: '', identification: '', password: '', is_active: 1 };
    this.modalError.set(null);
    this.usuarioEditando.set(null);
    this.modalMode.set('crear');
  }

  // ── Abrir modal EDITAR ────────────────────────────────────
  abrirEditar(u: User) {
    this.form = {
      full_name:      u.full_name,
      email:          u.email,
      identification: u.identification,
      password:       '',
      is_active:      u.is_active
    };
    this.modalError.set(null);
    this.usuarioEditando.set(u);
    this.modalMode.set('editar');
  }

  // ── Cerrar modal ──────────────────────────────────────────
  cerrarModal() {
    this.modalMode.set(null);
    this.modalError.set(null);
  }

  // ── Guardar (crear o editar) ──────────────────────────────
  guardar() {
    this.modalCargando.set(true);
    this.modalError.set(null);

    if (this.modalMode() === 'crear') {

      const payload: CreateUserPayload = {
        full_name:      this.form.full_name,
        email:          this.form.email,
        identification: this.form.identification,
        password:       this.form.password,
        is_active:      this.form.is_active
      };

      this.userService.createUser(payload).subscribe({
        next: () => {
          this.modalCargando.set(false);
          this.cerrarModal();
          this.cargarUsuarios();
        },
        error: (err) => {
          console.error('[CREATE]', err);
          this.modalError.set('Error al crear el usuario. Verifica los datos.');
          this.modalCargando.set(false);
        }
      });

    } else {

      const u = this.usuarioEditando()!;
      const payload: UpdateUserPayload = {
        full_name:      this.form.full_name,
        email:          this.form.email,
        identification: this.form.identification,
        is_active:      this.form.is_active
      };

      // Solo incluir password si el admin escribió uno nuevo
      if (this.form.password.trim()) {
        payload.password = this.form.password;
      }

      this.userService.updateUser(u.id, payload).subscribe({
        next: () => {
          this.modalCargando.set(false);
          this.cerrarModal();
          this.cargarUsuarios();
        },
        error: (err) => {
          console.error('[UPDATE]', err);
          this.modalError.set('Error al actualizar el usuario.');
          this.modalCargando.set(false);
        }
      });
    }
  }

  // ── Pedir confirmación de eliminación ─────────────────────
  confirmarEliminar(u: User) {
    this.usuarioAEliminar.set(u);
  }

  // ── Cancelar eliminación ──────────────────────────────────
  cancelarEliminar() {
    this.usuarioAEliminar.set(null);
  }

  // ── Ejecutar eliminación ──────────────────────────────────
  eliminar() {
    const u = this.usuarioAEliminar();
    if (!u) return;

    this.userService.deleteUser(u.id).subscribe({
      next: () => {
        this.usuarioAEliminar.set(null);
        this.cargarUsuarios();
      },
      error: (err) => {
        console.error('[DELETE]', err);
        this.usuarioAEliminar.set(null);
        this.error.set('Error al eliminar el usuario.');
      }
    });
  }
}