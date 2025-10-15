import { Injectable } from '@angular/core';
import { HorizontalMenu } from './horizontal-nav.service';


const TOKEN_KEY = 'AuthToken';
const USERNAME_KEY = 'AuthUserName';
const AUTHORITIES_KEY = 'AuthAuthorities';
const MENU_KEY = 'Menu';
const NAME_KEY = 'AuthName';
const ID_KEY = 'AuthID';



@Injectable({
  providedIn: 'root'
})
export class TokenService {
  token: string;
  roles: Array<string> = [];
  menu: HorizontalMenu[] = [];

  constructor() { }

  public setToken(token: string): void {
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.setItem(TOKEN_KEY, token);
  }

  public getToken(): string {
    this.token = localStorage.getItem(TOKEN_KEY)!
    // console.log(this.token);
    return this.token;
  }

  public setUserName(userName: string): void {
    window.localStorage.removeItem(USERNAME_KEY);
    window.localStorage.setItem(USERNAME_KEY, userName);
  }

  public getUserName(): string {
    return localStorage.getItem(USERNAME_KEY)!;
  }

  public setNombre(nombre: string): void {
    window.localStorage.removeItem(NAME_KEY);
    window.localStorage.setItem(NAME_KEY, nombre);
  }

  public getNombre(): string {
    return localStorage.getItem(NAME_KEY)!;
  }

  public setAuthorities(authorities: string[]): void {
    window.localStorage.removeItem(AUTHORITIES_KEY);
    window.localStorage.setItem(AUTHORITIES_KEY, JSON.stringify(authorities));
  }

  public getAuthorities(): string[] {
    this.roles = [];
    if (localStorage.getItem(AUTHORITIES_KEY)) {
      JSON.parse(localStorage.getItem(AUTHORITIES_KEY)!).forEach(authority => {
        this.roles.push(authority.authority);
      });
    }
    return this.roles;
  }

  public getIdUsuario(): number{
    return Number(localStorage.getItem(ID_KEY))!;
  }

  public setIdUsuario(id: number): void{
    window.localStorage.removeItem(ID_KEY);
    window.localStorage.setItem(ID_KEY, id.toString());
  }

  // public setMenu(menu: HorizontalMenu[]): void{

  //   window.localStorage.removeItem(MENU_KEY);
  //   window.localStorage.setItem(MENU_KEY, JSON.stringify(menu));
  // }

  // public getMenu(): HorizontalMenu[] {
  //   this.menu = [];

  //   if (localStorage.getItem(MENU_KEY)) {
  //     JSON.parse(localStorage.getItem(MENU_KEY)!).forEach(menu => {
  //       this.menu.push(menu);
  //     });
  //   }
  //   return this.menu;
  // }


  public logOut(): void {
    window.localStorage.clear();
  }

}
