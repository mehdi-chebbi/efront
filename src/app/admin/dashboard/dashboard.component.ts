import { Component, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Modal } from 'bootstrap';
import jwt_decode from 'jwt-decode';
import { Formation } from 'src/models/Formation.model';
import { FormationsService } from 'src/services/formations.service';

import { UserServiceService } from 'src/services/user-service.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  @ViewChild('scrollContainer', { static: false }) scrollContainer!: ElementRef;

   formations: Formation[] = [];

   selectedFormation: Formation | null = null;
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
      scroll(direction: 'left' | 'right') {
        if (this.scrollContainer) {
          const container = this.scrollContainer.nativeElement;
          const scrollAmount = 220; // Distance de défilement
          container.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
        }
      }
      ajouterFormation() {
        console.log("Ajout d'une nouvelle formation !");
        // Ici, ajoute ta logique pour ajouter une formation (ex: redirection, modal, etc.)
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
  logout(): void {
    this.userService.logout().subscribe({
      next: () => {
        localStorage.removeItem("authToken"); // Suppression du token stocké
        this.router.navigate(["/user/auth"]); // Redirection après déconnexion
      },
      error: (err) => console.error("Erreur de déconnexion :", err)
    });
  }


  deleteFormation(formationId: any): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette formation ?')) {
      this.formationService.deleteFormation(formationId).subscribe(
        (response) => {
          console.log('Formation supprimée', response);
          this.formations = this.formations.filter(formation => formation._id !== formationId);
          // Vous pouvez ajouter une logique ici pour mettre à jour l'affichage, comme recharger les formations
        },
        (error) => {
          console.error('Erreur lors de la suppression de la formation', error);
        }
      );
    }
  }
}
