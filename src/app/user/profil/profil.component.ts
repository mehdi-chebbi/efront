import { ChangeDetectorRef, Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserServiceService } from 'src/services/user-service.service';
import jwt_decode from 'jwt-decode';
import { MatDialog } from '@angular/material/dialog';
import * as bootstrap from 'bootstrap';
import { EditProfileDialogComponent } from '../edit-profile-dialog/edit-profile-dialog.component';
import { FormGroup } from '@angular/forms';
import { AvisService } from 'src/services/avis.service';


@Component({
  selector: 'app-profil',
  templateUrl: './profil.component.html',
  styleUrls: ['./profil.component.css']
})
export class ProfilComponent {
  user: any = {};
  userId!: string;
  editForm!: FormGroup;
  isLoading = false;
  selectedFile: File | null = null;
  selectedFileName: string = '';
  userFormations: any[] =[];
  userAvis: any[] =[];
  FT: any;
  FTT: any;
  formationService: any;
  error: any
  stats:any;

  constructor(
    private userService: UserServiceService,
    private router: Router,
    public dialog: MatDialog,
    private userAvisServie : AvisService,
    private cdRef: ChangeDetectorRef,
    private route: ActivatedRoute
  ) {}



    logout(): void {
      this.userService.logout().subscribe({
        next: () => {
          localStorage.removeItem("authToken"); // Suppression du token stocké
          this.router.navigate(["/user/auth"]); // Redirection après déconnexion
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
      this.userId = decodedToken.userId;  // Assurez-vous que 'userId' est la clé dans votre token

      // Utiliser le service pour récupérer les détails de l'utilisateur
      this.userService.getUserDetails(this.userId).subscribe((data) => {
        this.user = data;
      });
    } else {
      console.error('Token non trouvé');
    }


    this.loadAvis()


    this.loadUserFormations()
  }

// Dans votre composant


loadAvis() {
  this.userAvisServie.getAvisByUserId(this.userId).subscribe({
    next: (response) => {
      if (response.success && response.data) {
        this.userAvis = response.data; // Stockez directement response.data
        console.log("Avis chargés:", this.userAvis);
      } else {
        this.userAvis = [];
      }
    },
    error: (err) => {
      console.error("Erreur lors du chargement des avis:", err);
      this.userAvis = [];
    }
  });
}
  menuItems: string[] = [
    'Formation',
    'Quiz',
    'Avis',
    'Compétences',
  ];
  selectedItem: string = 'Formation';

  selectItem(item: string) {
    this.selectedItem = item;
  }

  openEditDialog(): void {
    const dialogRef = this.dialog.open(EditProfileDialogComponent, {
      width: '600px',
      data: this.user
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.user = { ...this.user, ...result };
        console.log('Profil mis à jour :', this.user);
      }
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];  // Récupérer le fichier sélectionné

    if (file) {
      const formData = new FormData();
      formData.append('photo', file, file.name);  // Ajouter le fichier au FormData

      this.userService.updateUserPhoto(this.userId, formData).subscribe(
        (response) => {
          console.log('Photo mise à jour avec succès', response);

          // Si la réponse contient l'image mise à jour, la mettre à jour dans l'utilisateur
          if (response && response.updatedUser && response.updatedUser.photo) {
            this.user.photo = response.updatedUser.photo;
            console.log('Nouvelle photo :', this.user.photo);  // Mettre à jour l'image de profil
          } else {
            console.error('Aucune photo mise à jour dans la réponse');
          }
        },
        (error) => {
          console.error('Erreur lors de la mise à jour de la photo', error);
        }
      );
    }
  }
   evaluationNote =0 ;

  loadUserFormations(): void {
    this.userService.getUserEvaluationsWithDetails(this.userId).subscribe({
      next: (response) => {
        this.userFormations = response;
        console.log('Formations utilisateur:', this.userFormations);

        // Réinitialiser les compteurs
        this.FT = 0;
        this.FTT = 0;

        // Traiter chaque formation pour extraire les quiz et notes
        this.userFormations.forEach(formation => {
          console.log(`Formation: ${formation.formation?.titre}`);

          if (formation.quizes && formation.quizes.length > 0) {
            console.log('Quiz associés:');

            // Initialiser le total pour cette formation
            let formationTotal = 0;

            formation.quizes.forEach((quiz: any) => {
              // Initialiser noteObtenue si elle n'existe pas
              quiz.noteObtenue = quiz.noteObtenue || 0;
              console.log(`- ${quiz.titre}, Note obtenue: ${quiz.noteObtenue}`);

              // Ajouter la note au total de la formation
              formationTotal += quiz.noteObtenue;

            });

            // Ajouter le total de cette formation au total général (FT)
            this.FT += formationTotal;

            console.log(`Total pour ${formation.formation?.titre}: ${formationTotal}`);
            console.log('Total général:', this.FT);

            // Compter les évaluations (FTT)
            this.FTT += formation.quizes.filter((quiz: any) => quiz.evaluations).length;
          } else {
            console.log('Aucun quiz pour cette formation');
            formation.quizes = [];
          }
        });


        // Récupérer les IDs des formations
        const formationIds = this.userFormations
          .map(f => f.formation?._id)
          .filter(id => id) as string[];
        console.log("IDs des formations:", formationIds);

        // Charger les modules pour ces formations
        if (this.formationService && this.formationService.getFormationsWithModules) {
          this.formationService.getFormationsWithModules(formationIds).subscribe({
            next: (formationsWithModules: any[]) => {
              this.userFormations = this.userFormations.map(userFormation => {
                const fullFormation = formationsWithModules.find(f => f._id === userFormation.formation?._id);
                return {
                  ...userFormation,
                  modules: fullFormation?.modules || []
                };
              });

              this.calculateStats();
              console.log('Formations avec modules:', this.userFormations);
            },
            error: (err: any) => {
              console.error('Erreur lors du chargement des modules:', err);
              this.calculateStats(); // Appeler calculateStats même en cas d'erreur
            }
          });
        } else {
          this.calculateStats();
        }
      },
      error: (err) => {
        console.error('Erreur lors du chargement des formations:', err);
        this.error = "Échec du chargement des formations";
      }
    });
  }

  calculateFormationTotal(userFormation: any): number {
    if (!userFormation.quizes || userFormation.quizes.length === 0) return 0;

    const total = userFormation.quizes.reduce((sum: number, quiz: any) => {
        return sum + (quiz.noteObtenue || 0);
    }, 0);
    console.log("totale ", total)

    if (total > 80) {
        this.evaluationNote = this.evaluationNote+ 50;
        console.log("totale ",  this.evaluationNote)
    }

    return total;
}

  calculateStats(): void {
    if (this.userFormations.length === 0) {
      this.stats = {
        completed: 0,
        in_progress: 0,
        average_progress: 0
      };
      return;
    }

    const completed = this.userFormations.filter(f => f.status === 'completed').length;
    const inProgress = this.userFormations.filter(f => f.status === 'in_progress').length;
    const totalProgress = this.userFormations.reduce((sum, f) => sum + f.progress, 0);
    const averageProgress = Math.round(totalProgress / this.userFormations.length);

    this.stats = {
      completed,
      in_progress: inProgress,
      average_progress: averageProgress
    };
  }


  getAverageQuizScore(userFormation: any): number | null {
    if (!userFormation.quizes || userFormation.quizes.length === 0) return null;

    const validScores = userFormation.quizes
      .filter((quiz: any) => typeof quiz.noteObtenue === 'number')
      .map((quiz: any) => quiz.noteObtenue);

    if (validScores.length === 0) return null;

    const average = validScores.reduce((a: number, b: number) => a + b, 0) / validScores.length;
    return Math.round(average);
  }


  consulterCard(id: string): void {
    this.router.navigate(["/Participation", this.userId, id]);
  }


// Ouvrir la modal de confirmation
confirmDelete(avisId: string) {
  this.selectedAvisId = avisId;
  const modalElement = document.getElementById('deleteModal');

  if (modalElement) {
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
  } else {
    console.error('Modal element not found');
  }
}
selectedAvisId: string | null = null;

// Ouvrir la modal de confirmation


// Supprimer l'avis
deleteAvis() {
  if (this.selectedAvisId) {
    this.userAvisServie.deleteAvis(this.selectedAvisId).subscribe({
      next: () => {
        this.userAvis = this.userAvis.filter(avis => avis._id !== this.selectedAvisId);
        this.selectedAvisId = null;
      },
      error: (err) => {
        console.error('Erreur lors de la suppression:', err);
      }
    });
  }
}


// Supprimer l'avis



}

