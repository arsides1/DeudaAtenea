import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { NuevoUsuario } from 'src/app/models/security/nuevo-usuario';
import { AuthService } from 'src/app/shared/services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {

  username: string = "";
  token: string = "";

  password1: string = "";
  password2: string = "";

  showPassword1: boolean = false;
  showPassword2: boolean = false;

  flgTieneMayuscula: boolean = false;
  flgTieneMinuscula: boolean = false;
  flgTieneNumero: boolean = false;
  flgTieneCaracterEspecial: boolean = false;
  flgTieneMinCaracteres: boolean = false;
  flgEsContraseniaNueva: boolean = false;

  minCaracteresPermitidos: number = 6;

  objUsuario: NuevoUsuario = new NuevoUsuario();
  previousPassword: string = "";

  constructor(private route: ActivatedRoute, private router: Router, private authservice: AuthService) { }

  ngOnInit(): void {
    this.route.queryParams
      .subscribe(params => {
        this.username = params.username;
        this.token = params.token;
        this.authservice.getTokenValidation(this.token, this.username).subscribe(
          response => {
            if (!response){
              this.router.navigate(['/error/error404']);
            }
            else{
              this.authservice.getUsuarioXUsername(this.username).subscribe(
                data => {
                  this.objUsuario = data;
                  this.previousPassword = data.password;
                }, error => {
                  alert(error);
                }
              );
            }
          },
          error => {
            this.router.navigate(['/error/error404']);
          }
        )

        this.authservice.getUsuarioXUsername(this.username).subscribe(
          data => {
            this.objUsuario = data;
            this.previousPassword = data.password;
          }, error => {
            alert(error);
          }
        );
      }
    );
  }

  resetPassword(){
    this.objUsuario.password = this.password1;
    this.authservice.updatePassword(this.objUsuario).subscribe(
      response => {
        if (response){
          Swal.fire({
            icon: 'success',
            title: 'Tu contraseña ha sido modificada satisfactoriamente.',
            html: "<p>Te llegará un correo con tus nuevas credenciales.</p><p>¡Bienvenido(a) nuevamente a Atenea!</p>",
            confirmButtonColor: '#0162e8',
            customClass: {
              container: 'my-swal'
            },
          });
          this.router.navigate(['/auth/login']);
        }
        else{
          Swal.fire({
            icon: 'error',
            title: 'La contraseña que has ingresado ya fue utilizada anteriormente.',
            html: "<p>Por favor, ingresa una nueva contraseña.</p>",
            confirmButtonColor: '#0162e8',
            customClass: {
              container: 'my-swal'
            },
          });
        }
        
      },
      error => {
        alert(error);
      }
    )
  }

  validatePassword(): boolean{
    return (this.flgEsContraseniaNueva && this.flgTieneMinCaracteres && this.flgTieneCaracterEspecial && this.flgTieneNumero && this.flgTieneMinuscula && this.flgTieneMayuscula && this.password1 == this.password2);
  }

  validarCondicionesPassword(){
    this.flgTieneMayuscula = Boolean(this.password1.match(/[A-Z]/));
    this.flgTieneMinuscula = Boolean(this.password1.match(/[a-z]/));
    this.flgTieneNumero =  Boolean(this.password1.match(/\d/));
    this.flgTieneCaracterEspecial = Boolean(this.password1.match(/[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~¿¡°¬]/));
    this.flgTieneMinCaracteres = this.password1.length >= this.minCaracteresPermitidos;
    this.flgEsContraseniaNueva = this.previousPassword != this.password1;
  }

  toggleShow1(){
    this.showPassword1 = !this.showPassword1;
  }
  toggleShow2(){
    this.showPassword2 = !this.showPassword2;
  }

}
