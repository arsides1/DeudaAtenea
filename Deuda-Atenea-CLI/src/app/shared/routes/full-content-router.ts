import { Routes } from '@angular/router';

export const full_content: Routes = [
  { 
    path: '',
    loadChildren: () => import('../../components/dashboard/dashboard.module').then(m => m.DashboardModule),
  }
]