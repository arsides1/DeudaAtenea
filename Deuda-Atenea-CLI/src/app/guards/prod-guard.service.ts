import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { TokenService } from '../shared/services/token.service';

@Injectable({
  providedIn: 'root'
})
export class ProdGuardService implements CanActivate{

  realRol: string;

  constructor(private tokenService: TokenService,
              private router: Router) { }
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const expectedRol = route.data.expectedRol;

    const roles = this.tokenService.getAuthorities();

    let isExpectedRol = false;

    this.realRol = 'user';

    // roles.forEach(rol =>{
    //   if(rol == 'ROLE_ADMIN'){
    //     this.realRol = 'admin';
    //   }
    // });

    roles.forEach(rol =>{
      if(expectedRol.indexOf(rol) != -1){
        isExpectedRol = true;
      }
    });

    console.log("getToken(): ", this.tokenService.getToken());
    console.log("rolEsperado: ", expectedRol);
    console.log("esRolEsperado: ", isExpectedRol);

    // if(!this.tokenService.getToken() || expectedRol.indexOf(this.realRol) === -1){
    //   this.router.navigate(['/']);
    //   return false;
    // }

    if(!this.tokenService.getToken() || !isExpectedRol){
      this.router.navigate(['/paginaInicio']);
      return false;
    }
    return true;
  }
}
