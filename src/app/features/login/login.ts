import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LoginService } from '../../service/loginService/loginService';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private loginService = inject(LoginService);

  esRegistro = signal<boolean>(false);

  /* 👁 MOSTRAR PASSWORD */
  mostrarPassword = false;

  form = this.fb.group({
    full_name: [''],

    password: ['', [
      Validators.required
    ]],

    email: ['', [
      Validators.required,
      Validators.email
    ]],

    telephone: [''],
    identification: ['']
  });

  /* CAMBIAR LOGIN / REGISTRO */
  toggleModo() {
    this.esRegistro.set(!this.esRegistro());
    this.form.reset();
  }

  /* LOGIN */
  login() {
    if (this.form.valid) {
      const { email, password } = this.form.value;

      this.loginService.login(email!, password!).subscribe({
        next: (res) => {
          console.log('Login exitoso', res);

          // GUARDAR DATOS PARA EL PERFIL
          // Guardamos la respuesta completa para que el perfil tenga de donde sacar la info
          localStorage.setItem('usuario', JSON.stringify(res));

          this.router.navigate(['/home']);
        },
        error: (err) => {
          console.error('Error en login', err);
          if (err?.error?.message) {
            alert(err.error.message);
          } else {
            alert('Usuario no registrado o credenciales incorrectas');
          }
        }
      });

    } else {
      const emailControl = this.form.get('email');
      if (emailControl?.hasError('required')) {
        alert('El correo es obligatorio');
      } 
      else if (emailControl?.hasError('email')) {
        alert('El correo no tiene un formato válido');
      } 
      else if (emailControl?.hasError('pattern')) {
        alert('El correo debe ser institucional (@uces.edu.co)');
      } 
      else {
        alert('Por favor, revisa los campos');
      }
    }
  }

  /* REGISTRO */
  registrar() {
    if (this.form.valid) {
      const datos = this.form.value;

      this.loginService.createUser(datos).subscribe({
        next: (res) => {
          console.log('Registro exitoso', res);
          alert('Usuario registrado correctamente');
          this.esRegistro.set(false);
          this.form.reset();
        },
        error: (err) => {
          console.error('Error en registro', err);
          if (err?.error?.message) {
            alert(err.error.message);
          } else {
            alert('Error al registrar usuario');
          }
        }
      });
    } else {
      alert('Por favor completa los campos correctamente');
    }
  }
}