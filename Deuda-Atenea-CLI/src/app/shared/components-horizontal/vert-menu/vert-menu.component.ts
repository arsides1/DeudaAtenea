import { Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { TokenService } from '../../services/token.service';
import { HorizontalMenu, HorizontalNavService } from '../../services/horizontal-nav.service';

@Component({
  selector: 'app-vert-menu',
  templateUrl: './vert-menu.component.html',
  styleUrls: ['./vert-menu.component.scss']
})
export class VertMenuComponent implements OnInit, OnChanges {
  @Input() isCollapsed = false;
  @Output() collapsedChange = new EventEmitter<boolean>();
  
  public menuItems: HorizontalMenu[] = [];
  public topMenuItems: HorizontalMenu[] = []; // Físico e IFD
  public middleMenuItems: HorizontalMenu[] = []; // Demás elementos
  public adminMenuItems: HorizontalMenu[] = []; // Mantenedor y Administrador
  public url: any;
  isLogged = false;
  nombreUsuario = '';

  // Nombres de los elementos para cada sección
  private topSectionNames = ['Fx y Tasas', 'Materias Primas','Límites','Fret'];
  private adminSectionNames = ['Mantenedor', 'Administrador'];
  
  // Umbral para considerar un texto como largo
  private longTextThreshold = 25;

  constructor(
    private router: Router,
    private horizontalNavService: HorizontalNavService,
    public elRef: ElementRef,
    private tokenService: TokenService,
  ) {}

  ngOnInit(): void {
    if (this.tokenService.getToken()) {
      this.isLogged = true;
      this.nombreUsuario = this.tokenService.getUserName();
    } else {
      this.isLogged = false;
    }

    // Recuperar el estado de colapso del localStorage
    const savedState = localStorage.getItem('menuCollapsed');
    if (savedState) {
      this.isCollapsed = savedState === 'true';
    }

    this.loadMenuBasedOnProfile();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Guardar el estado de colapso cuando cambia
    if (changes.isCollapsed && !changes.isCollapsed.firstChange) {
      localStorage.setItem('menuCollapsed', this.isCollapsed.toString());
    }
  }

  toggleCollapse(): void {
    this.isCollapsed = !this.isCollapsed;
    this.collapsedChange.emit(this.isCollapsed);
    localStorage.setItem('menuCollapsed', this.isCollapsed.toString());
  }

  // Método que solo expande el menú si está colapsado
  expandMenu(event: MouseEvent): void {
    // Solo expandir si está colapsado
    if (this.isCollapsed) {
      // Prevenir la propagación para evitar comportamientos inesperados
      event.stopPropagation();
      
      this.isCollapsed = false;
      this.collapsedChange.emit(this.isCollapsed);
      localStorage.setItem('menuCollapsed', this.isCollapsed.toString());
    }
  }

  // Método para manejar clics en iconos cuando el menú está colapsado
  handleIconClick(event: MouseEvent): void {
    if (this.isCollapsed) {
      this.expandMenu(event);
    } else {
      // Si el menú está expandido, permitir que el evento se propague normalmente
      event.stopPropagation();
    }
  }

  loadMenuBasedOnProfile(): void {
    this.subscribeToMenuItems(this.horizontalNavService.items);
  }

  subscribeToMenuItems(menuItemsObservable: any): void {
    menuItemsObservable.subscribe((menuItems: HorizontalMenu[]) => {
      this.menuItems = menuItems;
      
      // Separar los elementos de menú en las tres secciones
      this.separateMenuItems();
      
      this.listenToRouteChanges();
    });
  }

  separateMenuItems(): void {
    this.topMenuItems = [];
    this.middleMenuItems = [];
    this.adminMenuItems = [];
    
    this.menuItems.forEach(item => {
      if(item.title !== undefined){
        if (this.topSectionNames.includes(item.title)) {
          this.topMenuItems.push(item);
        } else if (this.adminSectionNames.includes(item.title)) {
          this.adminMenuItems.push(item);
        } else {
          this.middleMenuItems.push(item);
        }
      }
      
    });
  }

  listenToRouteChanges(): void {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.setActiveMenuByUrl(event.url);
      }
    });
  }

  setActiveMenuByUrl(url: string): void {
    // Función para verificar y activar elementos del menú
    const activateMenu = (items: HorizontalMenu[]) => {
      items.forEach(item => {
        // Resetear estado activo
        item.active = false;
        
        // Activar si la ruta coincide
        if (item.path === url) {
          this.setMenuActive(item);
        }
        
        // Revisar hijos de primer nivel
        if (item.children) {
          item.children.forEach(childItem => {
            childItem.active = false;
            
            if (childItem.path === url) {
              this.setMenuActive(childItem);
              item.active = true; // Activar padre también
            }
            
            // Revisar hijos de segundo nivel
            if (childItem.children) {
              childItem.children.forEach(grandChildItem => {
                grandChildItem.active = false;
                
                if (grandChildItem.path === url) {
                  this.setMenuActive(grandChildItem);
                  childItem.active = true; // Activar padre
                  item.active = true; // Activar abuelo
                }
                
                // Revisar hijos de tercer nivel (si existen)
                if (grandChildItem.children) {
                  grandChildItem.children.forEach(greatGrandChildItem => {
                    greatGrandChildItem.active = false;
                    
                    if (greatGrandChildItem.path === url) {
                      this.setMenuActive(greatGrandChildItem);
                      grandChildItem.active = true; // Activar padre
                      childItem.active = true; // Activar abuelo
                      item.active = true; // Activar bisabuelo
                    }
                  });
                }
              });
            }
          });
        }
      });
    };
    
    // Aplicar a los tres grupos de menús
    activateMenu(this.topMenuItems);
    activateMenu(this.middleMenuItems);
    activateMenu(this.adminMenuItems);
  }

  setMenuActive(item: HorizontalMenu): void {
    item.active = true;
  }

  toggleSubMenu(item: HorizontalMenu, event: MouseEvent): void {
    // Si estamos abriendo un nuevo submenú, cerrar todos los demás excepto los ancestros
    if (!item.active) {
      const ancestors = this.findAllAncestors(item);
      this.closeAllSubMenusExcept(item, ancestors);
    }
    
    item.active = !item.active;
    
    // Detener la propagación para evitar que el evento llegue al contenedor del menú
    event.stopPropagation();
  }

  // Método para encontrar todos los ancestros de un elemento del menú
  private findAllAncestors(targetItem: HorizontalMenu): HorizontalMenu[] {
    const ancestors: HorizontalMenu[] = [];
    
    const findInMenu = (items: HorizontalMenu[], target: HorizontalMenu, currentPath: HorizontalMenu[]): boolean => {
      for (const item of items) {
        if (item === target) {
          ancestors.push(...currentPath);
          return true;
        }
        
        if (item.children) {
          const newPath = [...currentPath, item];
          if (findInMenu(item.children, target, newPath)) {
            return true;
          }
        }
      }
      return false;
    };
    
    // Buscar en todas las secciones del menú
    findInMenu(this.topMenuItems, targetItem, []);
    findInMenu(this.middleMenuItems, targetItem, []);
    findInMenu(this.adminMenuItems, targetItem, []);
    
    return ancestors;
  }

  // Cerrar todos los submenús excepto el especificado y sus ancestros
  private closeAllSubMenusExcept(exceptItem: HorizontalMenu, exceptAncestors: HorizontalMenu[] = []): void {
    // Función recursiva para cerrar submenús
    const closeSubMenus = (items: HorizontalMenu[], except: HorizontalMenu, ancestors: HorizontalMenu[]) => {
      items.forEach(menuItem => {
        // No cerrar si es el item excepto o uno de sus ancestros
        if (menuItem !== except && !ancestors.includes(menuItem) && menuItem.type === 'sub') {
          menuItem.active = false;
          
          // Cerrar todos los hijos también
          if (menuItem.children) {
            closeSubMenus(menuItem.children, except, ancestors);
          }
        } else if (menuItem.children) {
          // Si no se debe cerrar este item, continuar revisando sus hijos
          closeSubMenus(menuItem.children, except, ancestors);
        }
      });
    };
    
    // Aplicar a todas las secciones del menú
    closeSubMenus(this.topMenuItems, exceptItem, exceptAncestors);
    closeSubMenus(this.middleMenuItems, exceptItem, exceptAncestors);
    closeSubMenus(this.adminMenuItems, exceptItem, exceptAncestors);
  }

  // Método para colapsar el menú (usado cuando se hace clic en un enlace)
  collapseMenu(): void {
    if (!this.isCollapsed) {
      this.isCollapsed = true;
      this.collapsedChange.emit(this.isCollapsed);
      localStorage.setItem('menuCollapsed', this.isCollapsed.toString());
    }
  }

  // Método para manejar clic en enlaces y colapsar el menú
  handleLinkClick(menuItem: HorizontalMenu, event: MouseEvent): void {
    // Si está colapsado y se hace clic en un enlace, primero expandir el menú
    if (this.isCollapsed) {
      this.expandMenu(event);
      return;
    }
    
    // Si el menú está expandido y es un enlace activo
    if (menuItem.type === 'link' && !menuItem.disabled) {
      // Detener propagación para evitar comportamientos inesperados
      event.stopPropagation();
      
      // Colapsar el menú cuando se hace clic en un enlace
      setTimeout(() => {
        this.collapseMenu();
      }, 300); // Pequeño delay para que la navegación se complete antes de colapsar
    }
  }

  // Método para verificar si un texto es muy largo
  isLongText(text: string): boolean {
    if (!text) return false;
    return text.length > this.longTextThreshold;
  }

  // Método opcional para abreviar textos muy largos si es necesario
  getShortTitle(title: string, maxLength: number = 22): string {
    if (!title || title.length <= maxLength) return title;
    return title.substring(0, maxLength) + '...';
  }

  onLogOut(): void {
    this.tokenService.logOut();
    this.router.navigate(['/auth/login']);
  }
}