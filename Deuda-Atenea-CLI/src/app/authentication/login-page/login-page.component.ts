import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ReCaptcha2Component } from 'ngx-captcha';
import { LoginUsuario } from 'src/app/models/security/login-usuario';
import { AuthService } from 'src/app/shared/services/auth.service';
import { TokenService } from 'src/app/shared/services/token.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss']
})
export class LoginPageComponent implements OnInit {

  isLogged = false;
  isLoginFail = false;
  loginUsuario: LoginUsuario;
  nombreUsuario: string;
  password: string;
  roles: string[] = [];
  active:any;
  errMsj: string;
  registro:number;
  siteKey = "6LdrSQ4pAAAAAGKC--KpRMFBcPHSy81G6Jbs1oZM";
  captchaSucces = 0;

  @ViewChild('captcha') captchaComponent!: ReCaptcha2Component;
  
  constructor(private authservice: AuthService, private router: Router, private formBuilder : FormBuilder,
              private tokenService: TokenService) { }

  ngOnInit(): void {
    if(this.tokenService.getToken()){
      this.isLogged = true;
      this.isLoginFail = false;
      this.roles = this.tokenService.getAuthorities();
    }

    // if(this.isLogged = true){
    //   this.router.navigate(['/paginaInicio']);
    // }

    // this.loginForm = this.formBuilder.group({
    //   username : ['aalzap@alicorp.com.pe',[Validators.required, Validators.email]],
    //   password : ['admindemo', Validators.required]
    // });
  }

  onLogin(): void{
    if(this.captchaSucces == 2 || this.captchaSucces == 0){
      this.loginUsuario = new LoginUsuario(this.nombreUsuario, this.password);
      this.authservice.loginUsuario(this.loginUsuario).subscribe(
        data => {
          this.isLogged = true;
          this.isLoginFail = false;
  
          this.tokenService.setToken(data.token);
          this.tokenService.setUserName(data.nombreUsuario);
          this.tokenService.setAuthorities(data.authorities);
          this.tokenService.setNombre(data.nombre);
          this.tokenService.setIdUsuario(data.id);
          
          // if (data.menu) {
          //   this.tokenService.setMenu(data.menu);
          // }

          this.roles = data.authorities;
          this.guardarLogUsuario(1,this.tokenService.getUserName())
          this.router.navigate(['/paginaInicio']);
        },
        err => {
          this.isLogged = false;
          this.isLoginFail = true;
          this.errMsj = err.error;
          if(err.error == 'contraseña expirada'){
            this.passwordExpirado();
          }
          else if(err.error == 'usuario nuevo'){
            this.usuarioNuevo();
          }
          else{
            Swal.fire({
              icon: 'error',
              title: 'Aviso',
              text: 'Credenciales inválidas',
              confirmButtonColor: '#0162e8',
              customClass: {
                container: 'my-swal'
              }
            });
            if(this.captchaSucces == 2){
              this.captchaSucces = 1;
              this.captchaComponent.resetCaptcha();
            }
          }
        }
      );

    } else{
      Swal.fire({
        icon: 'error',
        title: 'Aviso',
        text: 'Captcha no resuelto',
        confirmButtonColor: '#0162e8',
        customClass: {
          container: 'my-swal'
        }
      })
    }
    
  }

  passwordExpirado(){
    Swal.fire({
      icon: 'warning',
      title: 'Contraseña expirada',
      html: 'Su contraseña ha expirado.<br>Por favor, actualice su contraseña para poder ingresar a Atenea.',
      confirmButtonColor: '#0162e8',
      customClass: {
        container: 'my-swal'
      }
    });
    this.router.navigate(['/auth/forgot-password']);
  }

  usuarioNuevo(){
    Swal.fire({
      icon: 'warning',
      title: 'Cambiar contraseña',
      html: 'Debe actualizar su contraseña al ser este su primer ingreso a Atenea.',
      confirmButtonColor: '#0162e8',
      customClass: {
        container: 'my-swal'
      }
    });
    this.router.navigate(['/auth/forgot-password']);
  }


  public guardarLogUsuario(idEvento:number,usuario:string): void {
      
    }

    onCaptchaResolved(response: string){
      this.captchaSucces = 2;
    }

    handleLoad(){
      this.captchaSucces = 1;
    }
  
}
