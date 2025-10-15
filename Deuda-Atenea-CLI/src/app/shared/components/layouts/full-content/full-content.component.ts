import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-full-content',
  templateUrl: './full-content.component.html',
  styleUrls: ['./full-content.component.scss']
})
export class FullContentComponent implements OnInit {

  sidenavtoggled1: any;
  constructor() { }

  ngOnInit(): void {
  }
  hoverEffect($event:any){
    
    this.sidenavtoggled1 = $event.type == 'mouseover' ? 'sidenav-toggled1' : '';
  }
}
