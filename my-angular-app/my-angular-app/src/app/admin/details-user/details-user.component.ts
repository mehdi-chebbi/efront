import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from 'src/models/user.model';
import { FormationsService } from 'src/services/formations.service';
import { ParticipationService } from 'src/services/participation.service';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import { UserServiceService } from 'src/services/user-service.service';



interface Stats {
  completed: number;
  in_progress: number;
  average_progress: number;
}

@Component({
  selector: 'app-details-user',
  templateUrl: './details-user.component.html',
  styleUrls: ['./details-user.component.css']
})
export class DetailsUserComponent implements OnInit {
  @ViewChild('pdfContent') pdfContent!: ElementRef;
  userId: string = '';
  user: any | null = null;
  userFormations: any[] = [];
  stats: Stats = {
    completed: 0,
    in_progress: 0,
    average_progress: 0
  };
  isLoading: boolean = true;
  error: string | null = null;
  FTT: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private participationService : ParticipationService,
    private userService: UserServiceService,
    private formationService:FormationsService
  ) { }

  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('id') || '';

    if (!this.userId) {
      this.error = "ID utilisateur non fourni";
      this.isLoading = false;
      return;
    }

    this.loadUserData();
    this.loadUserFormations();
    this.getUserProgress()
    console.log(this.progresUser)

  }

  loadUserData(): void {
    this.isLoading = true;
    console.log(this.userId)
    this.userService.getUserDetails(this.userId).subscribe({
      next: (response) => {
        this.user = response;
        console.log(this.user)
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des données utilisateur:', err);
        this.error = "Échec du chargement des données utilisateur";
        this.isLoading = false;
      }
    });
  }

  getProgressColorClass(progress: number): string {
    if (progress >= 80) return 'bg-gradient-success';
    if (progress >= 50) return 'bg-gradient-info';
    if (progress > 0) return 'bg-gradient-warning';
    return 'bg-gradient-secondary';
  }
  getModuleProgress(moduleId: string): any {
    return this.progresUser?.find((p: { moduleId: string; }) => p.moduleId === moduleId);
  }
  getGlobalProgressColor(progress: number): string {
    if (progress >= 100) return 'bg-gradient-success';
    if (progress >= 70) return 'bg-gradient-info';
    if (progress > 0) return 'bg-gradient-primary';
    return 'bg-gradient-secondary';
  }

  getStatusText(status: string): string {
    switch(status) {
      case 'completed': return 'Terminé';
      case 'in_progress': return 'En cours';
      case 'not_started': return 'Non commencé';
      default: return 'Inconnu';
    }
  }

  FT : any = 0;


  hasHighScoreQuizzes(quizes: any[]): boolean {
    return quizes?.some(quiz => quiz.noteObtenue > 80);
  }

  // Méthode existante pour la couleur des notes
  getNoteColorClass(note: number): string {
    if (note >= 80) return 'success';  // Vert pour excellence
    if (note >= 60) return 'warning';  // Orange
    return 'danger';                   // Rouge
  }
  loadUserFormations(): void {
    this.userService.getUserEvaluationsWithDetails(this.userId).subscribe({
      next: (response) => {
        this.userFormations = response;
        console.log('Formations utilisateur:', this.userFormations);

        // Traiter chaque formation pour extraire les quiz et notes
    this.userFormations.forEach(formation => {
      console.log(`Formation: ${formation.formation.titre}`);

      if (formation.quizes && formation.quizes.length > 0) {
        console.log('Quiz associés:');
        formation.quizes.forEach((quiz: { titre: any; noteObtenue: any; }) => {
          console.log(`- ${quiz.titre}, Note obtenue: ${quiz.noteObtenue}`);
          this.FT =  formation.quizes.filter((quiz: { noteObtenue: number; }) => quiz.noteObtenue > 80).length;
          this.FTT = this.FTT +  formation.quizes.filter((quiz: { evaluations: number; }) => quiz.evaluations).length;
          // Vous pouvez stocker ces données comme vous le souhaitez
          // Par exemple dans un tableau séparé ou les ajouter à l'objet formation
        });
      } else {
        console.log('Aucun quiz pour cette formation');
      }
    });


        // Récupérer les IDs des formations - correction ici
        const formationIds = this.userFormations.map(f => f.formation?._id).filter(id => id);
        console.log("IDs des formations:", formationIds);

        // Charger les modules pour ces formations
        if (formationIds.length > 0) {
          this.formationService.getFormationsWithModules(formationIds).subscribe({
            next: (formationsWithModules) => {
              // Associer les modules à chaque formation - correction ici
              this.userFormations = this.userFormations.map(userFormation => {
                const fullFormation = formationsWithModules.find(f => f._id === userFormation.formation?._id);
                return {
                  ...userFormation,
                  modules: fullFormation ? fullFormation.modules : [] // Note: vérifiez si c'est "modules" ou "modules" dans votre API
                };
              });

              this.calculateStats();
              console.log('Formations avec modules:', this.userFormations);
            },
            error: (err) => {
              console.error('Erreur lors du chargement des modules:', err);
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

  progresUser : any


  getUserProgress(): void {
    if (  this.userId ) {
      this.userService.findProgresByIdUser( this.userId ).subscribe({
        next: (response) => {
          console.log('Avancement mis à jour avec succès:', response);

          if (response && response.avancement && response.avancement.length > 0) {
            this.progresUser = [];
            let totalProgress = 0;

            response.avancement.forEach((module: any) => {
              const moduleId = module.moduleIdd;
              const lecons = module.lecons;
              const max1 = module.maxx;
              const totalProgresModule = module.totalProgresModule;

              lecons.forEach((lecon: any) => {
                this.progresUser.push({
                  moduleId: moduleId,
                  leconId: lecon.leconId,
                  max1: max1,
                  totalProgresModule: totalProgresModule,
                  progres: lecon.progres
                });

                totalProgress += lecon.progres;
              });

              console.log(`Module ID: ${moduleId}, max1: ${max1}, totalProgresModule: ${totalProgresModule}`);
            });

            console.log('Progression utilisateur:', this.progresUser);
          }
        },
        error: (error) => {
          console.error('Erreur lors de la mise à jour de l\'avancement:', error);
        }
      });
    } else {
      console.error('ID utilisateur non disponible');
    }
  }

  async generatePDF() {
    // Afficher un loader pendant la génération
    const loading = document.createElement('div');
    loading.innerHTML = `
      <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                  background: rgba(0,0,0,0.5); z-index: 9999; display: flex;
                  justify-content: center; align-items: center;">
        <div class="spinner-border text-light" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <span class="text-light ms-3">Génération du PDF en cours...</span>
      </div>
    `;
    document.body.appendChild(loading);

    try {
      const content = this.pdfContent.nativeElement;
      const canvas = await html2canvas(content, {
        scale: 2, // Qualité plus élevée
        logging: false,
        useCORS: true,
        allowTaint: true,
        scrollY: -window.scrollY
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210; // A4 width in mm
      const imgHeight = canvas.height * imgWidth / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

      // Ajouter un pied de page professionnel
      const date = new Date().toLocaleDateString();
      pdf.setFontSize(10);
      pdf.setTextColor(150);
      pdf.text(`Rapport généré le ${date} - OSS Formation`, 10, pdf.internal.pageSize.height - 10);

      pdf.save(`rapport-formation-${this.user.nom}-${date}.pdf`);
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      alert('Une erreur est survenue lors de la génération du PDF');
    } finally {
      document.body.removeChild(loading);
    }
  }


}
