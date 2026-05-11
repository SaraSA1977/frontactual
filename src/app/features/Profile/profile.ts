import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoginService } from '../../service/loginService/loginService';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.scss'
})
export class Profile implements OnInit {
  
  private loginService = inject(LoginService);

  usuarioActual: any = null;
  editando = false;
  mostrarModalPassword = false;

  // Variables para el modal
  passwordAnterior = '';
  nuevaPassword = '';
  confirmarPassword = '';

  ngOnInit() {
    // Obtenemos los datos directamente del Signal del service
    // Hacemos una copia ({...}) para no modificar el original hasta dar Guardar
    const user = this.loginService.user();
    if (user) {
      this.usuarioActual = { ...user };
    }
  }

  // --- ACTUALIZAR DATOS BÁSICOS ---
toggleEdicion() {
  if (this.editando) {
    // 🧹 ESTA ES LA MAGIA: 
    // Tomamos el ID, lo volvemos texto y cortamos lo que haya después de ":"
    const idOriginal = this.usuarioActual.id.toString();
    const idLimpio = parseInt(idOriginal.split(':')[0]);

    console.log("Enviando ID limpio al servidor:", idLimpio);

    this.loginService.updateUser(idLimpio, this.usuarioActual).subscribe({
      next: (res: any) => {
        // Mostramos el mensaje que viene de tu Python (campos_cambiados)
        alert('✅ ' + (res.message || 'Cambios guardados'));
      },
      error: (err) => {
        console.error("Error en el servidor:", err);
        alert('❌ El servidor aún rechaza la petición. Revisa la consola de Flask.');
      }
    });
  }
  this.editando = !this.editando;
}

  // --- ACTUALIZAR CONTRASEÑA ---
  confirmarCambioPassword() {
    if (!this.passwordAnterior || !this.nuevaPassword || !this.confirmarPassword) {
      alert('⚠️ Completa todos los campos');
      return;
    }

    if (this.nuevaPassword !== this.confirmarPassword) {
      alert('❌ Las contraseñas nuevas no coinciden');
      return;
    }

    this.loginService.updatePassword(this.usuarioActual.id, this.passwordAnterior, this.nuevaPassword).subscribe({
      next: () => {
        alert('✅ Contraseña cambiada con éxito');
        this.cerrarModal();
      },
      error: (err) => {
        console.error(err);
        alert('❌ Error: ' + (err.error?.message || 'La clave actual es incorrecta'));
      }
    });
  }

  abrirModal() {
    this.mostrarModalPassword = true;
  }

  cerrarModal() {
    this.mostrarModalPassword = false;
    this.passwordAnterior = '';
    this.nuevaPassword = '';
    this.confirmarPassword = '';
  }

  obtenerIniciales(nombre: string): string {
    if (!nombre) return 'U';
    return nombre.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  }
}
