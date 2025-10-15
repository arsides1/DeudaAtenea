import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
// import { AngularFireAuth } from '@angular/fire/auth';
import {Router} from '@angular/router';
import { Observable } from 'rxjs';
import { JwtDTO } from 'src/app/models/security/jwt-dto';
import { LoginUsuario } from 'src/app/models/security/login-usuario';
import { NuevoUsuario } from 'src/app/models/security/nuevo-usuario';
import { Rol } from 'src/app/models/security/rol';
import { RolPorUsuario } from 'src/app/models/security/rol-usuario';
import { TokenVigencia } from 'src/app/models/security/tokenVigencia';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  authState: any = null;

  private apiServerUrl=environment.apiBaseUrl + "/auth/";

  constructor( private router: Router,private http: HttpClient) { 
  }

  get isUserAnonymousLoggedIn(): boolean {
    return (this.authState !== null) ? this.authState.isAnonymous : false
  }

  get currentUserId(): string {
    return (this.authState !== null) ? this.authState.uid : ''
  }

  get currentUserName(): string {
    return this.authState['email']
  }

  get currentUser(): any {
    return (this.authState !== null) ? this.authState : null;
  }

  get isUserEmailLoggedIn(): boolean {
    if ((this.authState !== null) && (!this.isUserAnonymousLoggedIn)) {
      return true
    } else {
      return false
    }
  }

registerWithEmail(email: string, password: string) {
  }
  loginWithEmail(email: string, password: string)
  {
  }

  singout(): void
  {
    // this.afu.signOut();
    this.router.navigate(['/login']);
  }

  public crearUsuario(nuevoUsuario: NuevoUsuario){
    return this.http.post(this.apiServerUrl + 'nuevo',nuevoUsuario, {responseType:'text'});
  }

  public loginUsuario(loginUsuario: LoginUsuario):Observable<JwtDTO>{
    return this.http.post<JwtDTO>(this.apiServerUrl + 'login',loginUsuario);
  }

  public getUsuarioXUsername(username: String): Observable<NuevoUsuario>{
    return this.http.get<NuevoUsuario>(`${this.apiServerUrl}getUserByUsername?username=${username}`);
  }

  public getUsuarioXEmail(email: String): Observable<NuevoUsuario>{
    return this.http.get<NuevoUsuario>(`${this.apiServerUrl}getUserByEmail?email=${email}`);
  }

  public crearToken(token: TokenVigencia):Observable<any>{
    return this.http.post<any>(this.apiServerUrl + 'nuevoToken',token);
  }

  public getTokenValidation(token: String, username: String): Observable<boolean>{
    return this.http.get<boolean>(`${this.apiServerUrl}getTokenValidation?token=${token}&username=${username}`);
  }

  public updatePassword(usuario: NuevoUsuario):Observable<any>{
    return this.http.post<any>(this.apiServerUrl + 'updatePassword',usuario);
  }

  public getDominiosCorreos():Observable<string[]>{
    return this.http.get<string[]>(`${this.apiServerUrl}getDominiosCorreos`);
  }

  public getRolesByUsuarioGestor(nombreUsuario: string):Observable<Rol[]>{
    return this.http.get<Rol[]>(`${this.apiServerUrl}getRolesByUsuarioGestor?nombreUsuario=${nombreUsuario}`);
  }

  public getUsuariosActivos():Observable<NuevoUsuario[]>{
    return this.http.get<NuevoUsuario[]>(`${this.apiServerUrl}getUsuariosActivos`);
  }

  public getRolesPorUsuarios():Observable<RolPorUsuario[]>{
    return this.http.get<RolPorUsuario[]>(`${this.apiServerUrl}getRolesPorUsuarios`);
  }

}
