import { Injectable } from '@angular/core';
import { FormControl } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';

//MenuBar
export interface HorizontalMenu {
  headTitle?: string;
  title?: string;
  path?: string;
  icon?: string;
  type?: string;
  badgeClass?: string;
  badgeValue?: string;
  active?: boolean;
  disabled?: boolean; // Nueva propiedad para deshabilitar opciones
  disabledMessage?: string; // Mensaje opcional para mostrar cuando está deshabilitado
  children?: HorizontalMenu[];
}

//MenuBar
export interface HorizontalMegaMenu {
  headTitle?: string;
  title?: string;
  path?: string;
  icon?: string;
  type?: string;
  badgeClass?: string;
  badgeValue?: string;
  active?: boolean;
  disabled?: boolean; // Nueva propiedad para deshabilitar opciones
  disabledMessage?: string; // Mensaje opcional para mostrar cuando está deshabilitado
  children?: HorizontalMegaMenu[];
}

@Injectable({
  providedIn: 'root'
})
export class HorizontalNavService {

  showDelay = new FormControl(1000);
  hideDelay = new FormControl(2000);


  constructor() { }


  MENUITEMS: HorizontalMenu[] = [
    {
      title: 'Fx y Tasas', icon: 'bar-chart', type: 'sub', badgeValue: '6', active: false,
      children: [

      ]
    },
    {
      title: 'VP Finanzas & Transformación', icon: 'settings', type: 'sub', badgeValue: '6', active: false,
      children: [
        {
          title: 'Tesoreria', icon: 'edit-3', type: 'sub', badgeValue: '11', active: false,
          children: [
            {
              title: 'Registros', icon: 'copy', type: 'sub', badgeValue: '6', active: false,
              children: [
                {path: '/RegistroIntercompanies', title: 'Carga Individual OC', type: 'link'}
              ]
            }
          ]
        },
        {
          title: 'Productos Financieros', icon: 'edit-3', type: 'sub', badgeValue: '11', active: false,
          children: [
          //  {
          //    path: '/RegistroDeuda', title: 'Registro', type: 'link',
          //  },
            {
              path: '/Registro', title: 'Listado', type: 'link',
            }
          ]
        }
      ]

    },

    {
      title: 'VP Soluciones & MMPP', icon: 'settings', type: 'sub', badgeValue: '6', active: false,
      children: [

      ]
    },
    {
      title: 'Límites', icon: 'bar-chart', type: 'sub', badgeValue: '11', active: false,
      children: [

      ]
    },
    {
      title: 'Mantenedor', icon: 'edit-3', type: 'sub', badgeValue: '11', active: false,
      children: [
        { path: '/MantenedorIntercompany', title: 'Intercompany', type: 'link' }

      ]
    },
    {
      title: 'Administrador', icon: 'edit-3', type: 'sub', badgeValue: '12', active: false,
      children: [

      ]
    },
    {
      title: 'Fret', icon: 'bar-chart', type: 'sub', badgeValue: '11', active: false,
      children: [

      ]
    },
    ];


  MENUITEMSCONSULTA: HorizontalMenu[] = [
    {
      title: 'Fx y Tasas', icon: 'bar-chart', type: 'sub', badgeValue: '6', active: false,
      children: [

      ]
    },
    {
      title: 'VP Finanzas & Transformación', icon: 'settings', type: 'sub', badgeValue: '6', active: false,
      children: [
            {
              title: 'Tesoreria', icon: 'edit-3', type: 'sub', badgeValue: '11', active: false,
              children: [
                  { title: 'Registros', icon: 'copy', type: 'sub', badgeValue: '6', active: false,
                  children: [
                                { path: '/RegistroIntercompanies', title: 'Carga Individual OC', type: 'link' }//----------------------
                            ]
                  }
              ]
            }
      ]
    },
    {
      title: 'VP Soluciones & MMPP', icon: 'settings', type: 'sub', badgeValue: '6', active: false,
      children: [

      ]
    },
    {
      title: 'Límites', icon: 'bar-chart', type: 'sub', badgeValue: '11', active: false,
      children: [

      ]
    },
    {
      title: 'Mantenedor', icon: 'edit-3', type: 'sub', badgeValue: '11', active: false,
      children: [
        { path: '/MantenedorIntercompany', title: 'Intercompany', type: 'link' }

      ]
    },
    {
      title: 'Administrador', icon: 'edit-3', type: 'sub', badgeValue: '12', active: false,
      children: [

      ]
    },
    {
      title: 'Fret', icon: 'bar-chart', type: 'sub', badgeValue: '11', active: false,
      children: [

      ]
    },
    ];




  MENUITEMS_FRET: HorizontalMenu[] = [
    {
      title: 'Fx y Tasas', icon: 'bar-chart', type: 'sub', badgeValue: '6', active: false,
      children: [

      ]
    },
    {
      title: 'VP Finanzas & Transformación', icon: 'settings', type: 'sub', badgeValue: '6', active: false,
      children: [
            {
              title: 'Tesoreria', icon: 'edit-3', type: 'sub', badgeValue: '11', active: false,
              children: [
                  { title: 'Registros', icon: 'copy', type: 'sub', badgeValue: '6', active: false,
                  children: [
                                { path: '/RegistroIntercompanies', title: 'Carga Individual OC', type: 'link' } //------------------------------------
                            ]
                  },
              ]
            }
      ]
    },
    {
      title: 'VP Soluciones & MMPP', icon: 'settings', type: 'sub', badgeValue: '6', active: false,
      children: [

      ]
    },
    {
      title: 'Límites', icon: 'bar-chart', type: 'sub', badgeValue: '11', active: false,
      children: [

      ]
    },
    {
      title: 'Mantenedor', icon: 'edit-3', type: 'sub', badgeValue: '11', active: false,
      children: [
        { path: '/MantenedorIntercompany', title: 'Intercompany', type: 'link' }

      ]
    },
    {
      title: 'Administrador', icon: 'edit-3', type: 'sub', badgeValue: '12', active: false,
      children: [

      ]
    },
    {
      title: 'Fret', icon: 'bar-chart', type: 'sub', badgeValue: '11', active: false,
      children: [

      ]
    },
    ];


  MENUITEMS_PrecioRealTime: HorizontalMenu[] = [
    {
      title: 'Fx y Tasas', icon: 'bar-chart', type: 'sub', badgeValue: '6', active: false,
      children: [

      ]
    },

    {
      title: 'VP Soluciones & MMPP', icon: 'settings', type: 'sub', badgeValue: '6', active: false,
      children: [

      ]
    },
    {
      title: 'Límites', icon: 'bar-chart', type: 'sub', badgeValue: '11', active: false,
      children: [

      ]
    },
    {
      title: 'Mantenedor', icon: 'edit-3', type: 'sub', badgeValue: '11', active: false,
      children: [
        { path: '/MantenedorIntercompany', title: 'Intercompany', type: 'link' }

      ]
    },
    {
      title: 'Administrador', icon: 'edit-3', type: 'sub', badgeValue: '12', active: false,
      children: [

      ]
    },
    {
      title: 'Fret', icon: 'bar-chart', type: 'sub', badgeValue: '11', active: false,
      children: [

      ]
    },
    ];




  //array
  items = new BehaviorSubject<HorizontalMenu[]>(this.MENUITEMS);
  itemsConsulta = new BehaviorSubject<HorizontalMenu[]>(this.MENUITEMSCONSULTA);
  itemsFret = new BehaviorSubject<HorizontalMenu[]>(this.MENUITEMS_FRET);
  // itemsMega = new BehaviorSubject<HorizontalMegaMenu[]>(this.MEGAMENUITEMS);
  itemsPrecios = new BehaviorSubject<HorizontalMenu[]>(this.MENUITEMS_PrecioRealTime);


}
