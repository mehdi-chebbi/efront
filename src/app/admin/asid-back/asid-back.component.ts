import { Component } from '@angular/core';
import { Router } from '@angular/router';
import jwt_decode from 'jwt-decode';
import { FormationsService } from 'src/services/formations.service';
import { NotificationService } from 'src/services/notification.service';
import { UserServiceService } from 'src/services/user-service.service';

@Component({
  selector: 'app-asid-back',
  templateUrl: './asid-back.component.html',
  styleUrls: ['./asid-back.component.css']
})
export class AsidBackComponent {
  user: any;
 constructor(private formationService:FormationsService ,private userService: UserServiceService,private router:Router,private notificationService: NotificationService) {}

    ngOnInit(): void {

   // Récupérer le token depuis localStorage (ou sessionStorage, selon votre choix)
        const token = localStorage.getItem('authToken');  // Exemple avec localStorage

        if (token) {
          // Décoder le token pour extraire l'ID utilisateur
          const decodedToken: any = jwt_decode(token);  // Use the decoded token function
          const userId = decodedToken.userId;  // Assurez-vous que 'userId' est la clé dans votre token

          // Utiliser le service pour récupérer les détails de l'utilisateur
          this.userService.getUserDetails(userId).subscribe((data) => {
            this.user = data;
          });
        } else {
          console.error('Token non trouvé');
        }

     

      }

  logout(): void {
    this.userService.logout().subscribe({
      next: () => {
        localStorage.removeItem("authToken"); // Suppression du token stocké
        this.router.navigate(["/user/auth"]); // Redirection après déconnexion
      },
      error: (err) => console.error("Erreur de déconnexion :", err)
    });
  }
}
