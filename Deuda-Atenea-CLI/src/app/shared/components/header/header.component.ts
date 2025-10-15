import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { LayoutService } from '../../services/layout.service';
import { NavService } from '../../services/nav.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  Body = document.querySelector('body')
  
  layoutSubscription: Subscription;
  
  constructor(
    public layoutService: LayoutService,
    public navServices: NavService,
    ) {
      this.layoutSubscription = layoutService.changeEmitted.subscribe(
        direction => {
          const dir = direction.direction;
        }
        )
        
      }
      ngOnInit(): void {
      }
      
      searchOpen(){
        this.Body?.classList.add('search-show')
      }
      
      search(e:any){
        e.preventDefault();
        
        this.Body?.classList.remove('search-show')
      }

      sidebarToggle(){
        let App = document.querySelector('.app')
        if ((this.navServices.collapseSidebar = !this.navServices.collapseSidebar)) {
          App?.classList.add('sidenav-toggled');
        }
        else {
          App?.classList.remove('sidenav-toggled');
        }
      }
      
}
