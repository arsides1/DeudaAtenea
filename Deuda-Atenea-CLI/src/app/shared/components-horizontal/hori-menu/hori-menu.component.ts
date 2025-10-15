import { Component, ElementRef, HostListener, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { HorizontalMegaMenu, HorizontalMenu, HorizontalNavService } from '../../services/horizontal-nav.service';
import { TokenService } from '../../services/token.service';

@Component({
  selector: 'app-hori-menu',
  templateUrl: './hori-menu.component.html',
  styleUrls: ['./hori-menu.component.scss']
})
export class HoriMenuComponent implements OnInit {

  public menuItems!: HorizontalMenu[];
  public megamenuItems!: HorizontalMegaMenu[];
  public url: any;
  public Body:any = document.querySelector('body');
  isLogged = false;
  nombreUsuario= '';
  // public perfiles= [];

  constructor(
    private router: Router,
    private horizontalNavService: HorizontalNavService,
    public elRef: ElementRef,
    private tokenService: TokenService,
  ) {    
 
  }
  

  //Active NavBar State
  setNavActive(item) {
    this.menuItems.filter(menuItem => {
      if (menuItem !== item) {
        menuItem.active = false;
        this.Body.classList.remove('active')
      }
      if (menuItem.children && menuItem.children.includes(item)) {
        menuItem.active = true;
      }
      if (menuItem.children) {
        menuItem.children.filter(submenuItems => {
          if (submenuItems.children && submenuItems.children.includes(item)) {
            menuItem.active = true;
            submenuItems.active = true;
          }
        });
      }
    });
    this.megamenuItems.filter(megaMenuItem => {
      if (megaMenuItem !== item) {
        megaMenuItem.active = false;
        this.Body.classList.remove('active')
      }
      if (megaMenuItem.children && megaMenuItem.children.includes(item)) {
        megaMenuItem.active = true;
      }
      if (megaMenuItem.children) {
        megaMenuItem.children.filter(submegaMenuItems => {
          if (submegaMenuItems.children && submegaMenuItems.children.includes(item)) {
            megaMenuItem.active = true;
            submegaMenuItems.active = true;
          }
        });
      }
    });
  }

  // Click Toggle menu
  toggleNavActive(item) {
    if (!item.active) {
      this.menuItems.forEach((a:any) => {
        if (this.menuItems.includes(item)) {
          a.active = false;
        }
        if (!a.children) { return false; }
        a.children.forEach(b => {
          if (a.children.includes(item)) {
            b.active = false;
          }
        });
        return;
      });
      
      this.megamenuItems.forEach((a:any) => {
        if (this.megamenuItems.includes(item)) {
          a.active = false;
        }
        if (!a.children) { return false; }
        a.children.forEach(b => {
          if (a.children.includes(item)) {
            b.active = false;
          }
        });
        return;
      });
    }
    
    item.active = !item.active;
  }


  ngOnInit(): void {
    if(this.tokenService.getToken()){
      this.isLogged = true;
      this.nombreUsuario = this.tokenService.getUserName();
    }else{
      this.isLogged = false;
    }
    
    this.horizontalNavService.items.subscribe(menuItems => {
      this.menuItems = menuItems;
      this.router.events.subscribe((event) => {
        if (event instanceof NavigationEnd) {
          menuItems.filter(items => {
            if (items.path === event.url) {
              this.setNavActive(items);
            }
            if (!items.children) { return false; }
            items.children.filter(subItems => {
              if (subItems.path === event.url) {
                this.setNavActive(subItems);
              }
              if (!subItems.children) { return false; }
              subItems.children.filter(subSubItems => {
                if (subSubItems.path === event.url) {
                  this.setNavActive(subSubItems);
                }
              });
              return;
            });
            return;
          });
        }
      })
    })

  }

  arrow: boolean = false;
  removeMenu(){
    this.Body.classList.remove('active')
  }

  onLogOut(): void{
    this.tokenService.logOut();
    //window.location.reload();
     this.router.navigate(['/auth/login']);
  }
  
}
