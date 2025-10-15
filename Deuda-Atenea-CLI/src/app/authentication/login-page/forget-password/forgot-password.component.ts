import { Component, OnInit } from '@angular/core';
import { TokenVigencia } from 'src/app/models/security/tokenVigencia';
import { AuthService } from 'src/app/shared/services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {

  username: string;
  flgCorreoEnviado: boolean = false;
  flgEnviandoCorreo: boolean = false;
  txtBotonEnviarCorreo: string = 'Enviar';
  //public urlResetPassword: string = "http://localhost:4200/auth/reset-password?username=jcollaos&token=123456asdfg";

  constructor(private authservice: AuthService) { }

  ngOnInit(): void {
  }

  obtenerUsuario(): void{
    this.flgCorreoEnviado = false;
    this.flgEnviandoCorreo = true;
    this.txtBotonEnviarCorreo = 'Enviando correo...';
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.username)){
      this.authservice.getUsuarioXEmail(this.username).subscribe(
        data => {
          let token = this.generarToken();
          this.guardarToken(token, data.id);
        },
        err => {
          this.flgCorreoEnviado = false;
          this.flgEnviandoCorreo = false;
          this.txtBotonEnviarCorreo = 'Enviar';
          Swal.fire({
            icon: 'error',
            title: 'Aviso',
            text: err.error,
            confirmButtonColor: '#0162e8',
            customClass: {
              container: 'my-swal'
            }
          });
        }
      );
    }
    else{
      this.authservice.getUsuarioXUsername(this.username).subscribe(
        data => {
          let token = this.generarToken();
          this.guardarToken(token, data.id);
        },
        err => {
          this.flgCorreoEnviado = false;
          this.flgEnviandoCorreo = false;
          this.txtBotonEnviarCorreo = 'Enviar';
          Swal.fire({
            icon: 'error',
            title: 'Aviso',
            text: err.error,
            confirmButtonColor: '#0162e8',
            customClass: {
              container: 'my-swal'
            }
          });
        }
      );
    }
  }

  generarToken(): string{
    const array = new Uint32Array(8);
    window.crypto.getRandomValues(array);
    let token = '';
    for (let i = 0; i < array.length; i++) {
      token += array[i].toString(16);
    }
    return token;
  }

  guardarToken(token: string, usuario_id: number){
    let tokenGuardar: TokenVigencia = new TokenVigencia();
    // let fechaHoy: Date = new Date();
    // let fechaManana: Date = new Date(fechaHoy.getTime() + 24 * 60 * 60 * 1000);
    tokenGuardar.id = 0;
    tokenGuardar.token = token;
    tokenGuardar.usuario_id = usuario_id;
    // tokenGuardar.fecha_creacion = fechaHoy;
    // tokenGuardar.fecha_expiracion = fechaManana;
    tokenGuardar.status = true;
    this.authservice.crearToken(tokenGuardar).subscribe(
      data => {
        //this.urlResetPassword += `username=${this.username}&token=${token}`;
        this.flgCorreoEnviado = true;
        this.flgEnviandoCorreo = false;
        this.txtBotonEnviarCorreo = 'Enviar';
      },
      err => {
        this.flgCorreoEnviado = false;
        this.flgEnviandoCorreo = false;
        this.txtBotonEnviarCorreo = 'Enviar';
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: "No se pudo enviar el correo. Por favor, inténtelo nuevamente.",
          confirmButtonColor: '#0162e8',
          customClass: {
            container: 'my-swal'
          }
        });
      }
    );
  }

  validarUsername(): boolean{
    return (this.username != undefined && this.username.length > 0);
  }
}
