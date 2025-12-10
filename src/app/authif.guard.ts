import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import jwt_decode from 'jwt-decode';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthifGuard implements CanActivate {
 constructor(private router: Router) {}

  canActivate(): boolean {
    const token = localStorage.getItem('authToken');

    if (!token) {
           // this.router.navigate(['/user/auth']);
      return false;
    }

    try {
      const decoded: any = jwt_decode(token);

      // Bloque l'accès si le rôle est "user"
   if (decoded.role === 'apprenant' || decoded.role === 'partenaire') {
  alert(`Vous êtes un ${decoded.role}, vous ne pouvez pas accéder à cette page administrative.`);
  this.router.navigate(['/user/home']);
  return false;
}


      // Autorisé (admin ou autre rôle autorisé)
      return true;
    } catch (error) {
      this.router.navigate(['/admin/dash']);
      return false;
    }
  }

}
