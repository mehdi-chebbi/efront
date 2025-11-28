import { Component } from '@angular/core';
import { Router } from '@angular/router';
import jwt_decode from 'jwt-decode';
import { FormationsService } from 'src/services/formations.service';
import { NotificationService } from 'src/services/notification.service';
import { UserServiceService } from 'src/services/user-service.service';

@Component({
  selector: 'app-nav-bar-back',
  templateUrl: './nav-bar-back.component.html',
  styleUrls: ['./nav-bar-back.component.css']
})
export class NavBarBackComponent {

  user: any = {};
  dropdownOpen = false;
  notifA : any[] = [];
  notifications: any[] = [];
  showNotificationBanner = false;
  lastNotification: any;

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

        this.notificationService.getNotifications().subscribe((notif) => {
          this.lastNotification = notif;
          this.notifications.unshift(notif);
          this.showNotificationBanner = true;

          console.log("message", notif);

          // Ajouter dans la base de données
          const userId = notif.idUser ; // Assure-toi d’avoir l’ID

          this.notificationService.addNotification({
            utilisateur: userId,
            message: notif.message
          }).subscribe({
            next: (res) => {
              console.log("Notification ajoutée à la base :", res);
            },
            error: (err) => {
              console.error("Erreur lors de l'ajout de la notification :", err);
            }
          });
        });
        this.notificationService.getNotification().subscribe((data) => {
          // Supposons que tu veux les stocker dans une variable notifications
          this.notifA= data;

          // Si tu veux afficher la dernière notification en haut
          if (data.length > 0) {
            this.lastNotification = data[0];
          }

          console.log("Notifications chargées depuis la base :", data);
        });


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

  isOpen = false;

toggleDropdown(event: MouseEvent) {
  event.preventDefault();
  event.stopPropagation();
  this.isOpen = !this.isOpen;
}
isUserDropdownOpen = false;

toggleUserDropdown(event: MouseEvent) {
  event.preventDefault();
  event.stopPropagation(); // évite que le document click ferme le menu
  this.isUserDropdownOpen = !this.isUserDropdownOpen;
}



}
