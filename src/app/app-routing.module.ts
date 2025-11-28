import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthifGuard } from './authif.guard';


const routes: Routes = [
  { path: 'user', loadChildren: () => import('src/app/user/user-routing.module').then(m => m.UserRoutingModule) },
  { path: 'admin', loadChildren: () => import('src/app/admin/admin-routing.module').then(m => m.AdminRoutingModule),canActivate: [AuthifGuard ] },


];



@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
