import { Component } from '@angular/core';
import { Router } from '@angular/router';
import jwt_decode from 'jwt-decode';
import { UserServiceService } from 'src/services/user-service.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {

 user: any = {};

  constructor(private userService: UserServiceService, private router: Router) {}

  logout(): void {
    this.userService.logout().subscribe({
      next: () => {
        localStorage.removeItem("authToken"); // Suppression du token stocké
        this.router.navigate(["/user/auth"]); // Redirection après déconnexion
        window.location.href = "/user/auth";
      },
      error: (err) => console.error("Erreur de déconnexion :", err)
    });
  }

   ngOnInit(): void {
      // Récupérer le token depuis localStorage (ou sessionStorage, selon votre choix)
      const token = localStorage.getItem('authToken');  // Exemple avec localStorage

      if (token) {
        // Décoder le token pour extraire l'ID utilisateur
        const decodedToken: any = jwt_decode(token);  // Use the decoded token function
        const userId = decodedToken.userId;  // Assurez-vous que 'userId' est la clé dans votre token

        // Utiliser le service pour récupérer les détails de l'utilisateur
        this.userService.getUserDetails(userId).subscribe((data: any) => {
          this.user = data;
        });
      } else {
        console.error('Token non trouvé');
      }
    }

}
