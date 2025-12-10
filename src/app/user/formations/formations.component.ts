import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Modal } from 'bootstrap';
import jwt_decode from 'jwt-decode';
import { Formation } from 'src/models/Formation.model';
import { FormationsService } from 'src/services/formations.service';
import { ParticipationService } from 'src/services/participation.service';
import { UserServiceService } from 'src/services/user-service.service';

@Component({
  selector: 'app-formations',
  templateUrl: './formations.component.html',
  styleUrls: ['./formations.component.css']
})
export class FormationsComponent implements OnInit {
  @ViewChild('scrollContainer') scrollContainer!: ElementRef;

  scrollLeft() {
    this.scrollContainer.nativeElement.scrollBy({
      left: -300,
      behavior: 'smooth'
    });
  }

  scrollRight() {
    this.scrollContainer.nativeElement.scrollBy({
      left: 300,
      behavior: 'smooth'
    });
  }
  formations: Formation[] = [];
  page: number = 1; // Page actuelle
  selectedFormation: Formation | null = null;
  user: any = {};
  isInscrit: boolean = false; // Ajout pour stocker le statut d'inscription
  searchTerm: string = '';
  selectedDepartment: string = '';
  allFormations: Formation[] = []; // Pour stocker toutes les formations originales
  constructor(
    private formationService: FormationsService,
    private userService: UserServiceService,
    private participationService: ParticipationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.formationService.getFormations().subscribe({
      next: (data) => {
        console.log('Données reçues :', data);
        this.allFormations = data; // Stockez toutes les formations
        this.formations = [...this.allFormations]; // Initialisez les formations affichées
      },
      error: (err) => console.error('Erreur lors du chargement des formations', err),
    });
    // Récupérer le token depuis localStorage
    const token = localStorage.getItem('authToken');

    if (token) {
      try {
        // Décoder le token
        const decodedToken: any = jwt_decode(token);
        const userId = decodedToken.userId; // Assurez-vous que 'userId' est bien présent

        // Récupérer les détails de l'utilisateur
        this.userService.getUserDetails(userId).subscribe({
          next: (data) => {
            this.user = data;
          },
          error: (error) => console.error('Erreur lors du chargement des informations utilisateur', error),
        });
      } catch (e) {
        console.error('Erreur lors du décodage du token', e);
      }
    } else {
      console.error('Token non trouvé');
    }
  }
  filterFormations(): void {
    this.formations = this.allFormations.filter(formation => {
      // Filtre par recherche textuelle
      const matchesSearch = !this.searchTerm ||
        formation.titre?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        formation.description?.toLowerCase().includes(this.searchTerm.toLowerCase());

      // Filtre par département
      const matchesDepartment = !this.selectedDepartment ||
        formation.departement === this.selectedDepartment;

      return matchesSearch && matchesDepartment;
    });
  }

  // ✅ Appeler checkParticipation uniquement lorsque la formation est sélectionnée
  openModal(formation: Formation) {
    this.selectedFormation = formation;

    if (this.user._id && this.selectedFormation?._id) {
      this.participationService.checkParticipation(this.user._id, this.selectedFormation._id).subscribe({
        next: (response) => {
          this.isInscrit = response.isInscrit;
          console.log('Participation:', response.isInscrit);
        },
        error: (error) => {
          console.error('Erreur lors de la vérification de la participation', error);
        }
      });
    }

    const modalElement = document.getElementById('formationModal');
    if (modalElement) {
      const modal = new Modal(modalElement);
      modal.show();
    } else {
      console.error('Le modal avec l\'ID "myModal" n\'a pas été trouvé.');
    }
  }

  showReadMore(formation: any): boolean {
    return formation?.description?.length > 250;
  }
  visibleCount = 3; // Afficher 3 formations au début

  afficherPlus() {
    if (this.visibleCount + 3 <= this.formations.length) {
      this.visibleCount += 3;
    } else {
      this.visibleCount = this.formations.length;
    }
  }

  leconIdd:[]=[]
  Moduless: any[] = [];

  // ✅ Gérer l'inscription
  toggleParticipation(): void {
    if (!this.user?._id || !this.selectedFormation?._id) {
      console.error('ID utilisateur ou ID formation manquant');
      return;
    }



    this.participationService.inscrireUtilisateurFormation(this.user._id, this.selectedFormation._id).subscribe({
      next: () => {
        console.log('Inscription réussie');
        this.isInscrit = true;

        // Récupérer les modules APRES l'inscription réussie
        this.formationService.getModulesByFormationId(this.selectedFormation?._id).subscribe({
          next: (response) => {
            this.Moduless = response.modules;
            console.log('Modules récupérés:', this.Moduless);

            // Vérifier que les modules et leçons existent avant d'accéder aux données
            if (this.Moduless.length > 0 && this.Moduless[0].lecons?.length > 0) {
              console.log(this.Moduless[0].lecons[0]);

              // Mettre à jour l'avancement SEULEMENT après récupération réussie des modules
              this.userService.updateAvancement(this.user._id, this.Moduless[0].lecons[0], this.Moduless[0]._id, 0)
              .subscribe({
                next: (response) => {
                  console.log('Avancement mis à jour avec succès:', response);
                },
                error: (error) => {
                  console.error("Erreur lors de la mise à jour de l'avancement:", error);
                }
              });
            } else {
              console.warn("Aucun module ou leçon trouvée.");
            }
          },
          error: (error) => {
            console.error("Erreur lors de la récupération des modules:", error);
          }
        });

        // Redirection après toutes les opérations
        window.location.href = `/Participation/${this.user?._id}/${this.selectedFormation?._id}`;
      },
      error: (error) => console.error("Erreur lors de l’inscription", error),
    });
  }

  // ✅ Gérer la désinscription
  deleteParticipation(): void {
    if (!this.user?._id || !this.selectedFormation?._id) {
      console.error('ID utilisateur ou ID formation manquant');
      return;
    }

    this.participationService.deleteParticipation(this.user._id, this.selectedFormation._id).subscribe({
      next: () => {
        console.log('Participation annulée');
        this.isInscrit = false;
      },
      error: (error) => console.error('Erreur lors de l’annulation', error),
    });
  }
}
