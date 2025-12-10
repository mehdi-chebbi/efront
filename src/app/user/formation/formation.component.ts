import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Modal } from 'bootstrap';
import jwt_decode from 'jwt-decode';
import { Formation } from 'src/models/Formation.model';
import { FormationsService } from 'src/services/formations.service';
import { UserServiceService } from 'src/services/user-service.service';

@Component({
  selector: 'app-formation',
  templateUrl: './formation.component.html',
  styleUrls: ['./formation.component.css']
})
export class FormationComponent {
  formations: Formation[] = [];


  user: any = {};
  constructor(private formationService:FormationsService ,private userService: UserServiceService,private router:Router) {}

  ngOnInit(): void {
    this.formationService.getFormations().subscribe({
      next: (data) => {
        console.log("Données reçues :", data); // Vérifier si le responsable est bien chargé
        this.formations = data;
      },
      error: (err) => console.error("Erreur lors du chargement des formations", err),
    });
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
    visibleCount = 3; // Afficher 3 formations au début

    afficherPlus() {
      if (this.visibleCount + 3 <= this.formations.length) {
        this.visibleCount += 3;
      } else {
        this.visibleCount = this.formations.length; // Afficher tout s'il reste moins de 3 formations
      }
    }

          openModal(formation: Formation) {
            this.selectedFormation = formation;

            const modalElement = document.getElementById('myModal');
            if (modalElement) {
              const modal = new Modal(modalElement);
              modal.show();
            } else {
              console.error('Le modal avec l\'ID "myModal" n\'a pas été trouvé.');
            }
          }

selectedFormation: Formation | null = null;

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



