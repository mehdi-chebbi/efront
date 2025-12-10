import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { UserServiceService } from 'src/services/user-service.service';
import Swal from 'sweetalert2';
import { EditUserDialogComponent } from '../edit-user-dialog/edit-user-dialog.component';
import jwt_decode from 'jwt-decode';
import { Formation } from 'src/models/Formation.model';
import { FormationsService } from 'src/services/formations.service';
import { QuizService } from 'src/services/quiz.service';
import { CertificatService } from 'src/services/certfication.service';

@Component({
  selector: 'app-details-back',
  templateUrl: './details-back.component.html',
  styleUrls: ['./details-back.component.css']
})
export class DetailsBackComponent implements OnInit {
  formation!: any; // Stocke une seule formation
  formationId!: string;
  quizzes: any[] = []; // Tableau pour stocker les quiz récupérés
  user: any = {};
  certificats:any
  certificat: any;
  certif: any[] = [];
  count :any ;
  selectedModule: any = null;
  dropdownOpen = false;
  errorMessage: any;
  safeImageUrl: any;
  sanitizer: any;

  constructor(
    private formationService: FormationsService,
    private userService: UserServiceService,
    private router: Router,
    private cetifservice : CertificatService,
    private quizService: QuizService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // 🔹 Récupérer l'ID depuis l'URL
    this.formationId = this.route.snapshot.paramMap.get('id') || '';
    console.log("ID Formation récupéré depuis l'URL :", this.formationId);

    // 🔹 Récupérer la formation par ID
    this.formationService.getFormationById(this.formationId).subscribe({
      next: (data) => {
        console.log("Données reçues pour la formation :", data);
        this.formation = data;

        // Vérifier si la formation contient des quiz et les récupérer
        if (this.formation.quiz) {
          this.formation.quiz.forEach((idquiz: string) => {
            this.afficherQuiz(idquiz);
          });
        }
      },
      error: (err) => console.error("Erreur lors du chargement de la formation", err),
    });

    // 🔹 Récupérer les infos de l'utilisateur connecté
    const token = localStorage.getItem('authToken');
    if (token) {
      const decodedToken: any = jwt_decode(token);
      const userId = decodedToken.userId; // Vérifie que 'userId' est bien la clé correcte

      this.userService.getUserDetails(userId).subscribe({
        next: (data) => this.user = data,
        error: (err) => console.error("Erreur lors de la récupération des infos utilisateur", err)
      });
    } else {
      console.error('Token non trouvé');
    }
    console.log("cerif",this.certificats)
    this.CertifGet()




  }
  imageLoaded = false;
  objectKeys = Object.keys;
  CertifGet(): void {
    this.cetifservice.getCertifByIdFormation(this.formationId).subscribe({
      next: (data) => {
        console.log("Certificat reçu :", data);
        this.certificat = data;
        console.log('dataimage', data[0]?.titre);
        if (Array.isArray(data) && data.length > 0) {
          this.certificat = data[0];
          console.log('Titre :', this.certificat.titre);
          console.log(this.certificat.references);
console.log(this.objectKeys(this.certificat.references));  // Vérifie ce que retourne objectKeys



        } else {
          console.log('Aucun certificat trouvé.');
        }


      },
      error: (err) => {
        console.error("Erreur :", err);
        this.errorMessage = 'Erreur lors du chargement du certificat.';
      },
      complete: () => {
        console.log("Chargement du certificat terminé.");
      }
    });
  }
  getReferenceKeys(): string[] {
    return this.certificat && this.certificat.references
      ? Object.keys(this.certificat.references)
      : [];
  }


  toggleLecons(module: any): void {
    this.selectedModule = (this.selectedModule === module) ? null : module;
  }

  logout(): void {
    this.userService.logout().subscribe({
      next: () => {
        localStorage.removeItem("authToken"); // 🔹 Supprime le token après déconnexion
        this.router.navigate(["/user/auth"]); // 🔹 Redirection
      },
      error: (err) => console.error("Erreur de déconnexion :", err)
    });
  }
  afficherQuiz(idquiz: string): void {
    this.quizService.getQuizById(idquiz).subscribe({
      next: (data) => {
        this.quizzes.push(data);  // Ajoute le quiz récupéré à la liste des quizzes

        // Vérification si 'data.questions' est défini et est un tableau
        if (Array.isArray(data.questions)) {
          this.count = data.questions.length; // Récupère le nombre de questions dans le tableau 'questions'
        } else {
          this.count = 0; // Si 'data.questions' n'est pas un tableau ou est undefined, on met count à 0
        }

        // Affiche le nombre de questions pour ce quiz spécifique
        console.log(`Le quiz avec l'ID ${idquiz} a ${this.count} question(s).`);
        console.log("Quiz récupéré :", data);
      },
      error: (err) => {
        console.error("Erreur de récupération du quiz :", err);
      }
    });
  }






  goToQuizDetail(quizId: string,idformation : any): void {
    if (quizId) {
      this.router.navigate(['/QuizDetail', quizId,idformation]);
    } else {
      console.error("L'ID du quiz est invalide !");
    }
  }


  deleteQuiz(quizId: string): void {
    const confirmation = window.confirm('Êtes-vous sûr de vouloir supprimer ce quiz ?');

    if (confirmation) {
      this.quizService.deleteQuiz(quizId).subscribe({
        next: () => {
          console.log('Quiz supprimé avec succès');
          // Afficher une alerte de succès après la suppression
          window.location.reload();
          // Vous pouvez éventuellement effectuer d'autres actions comme la mise à jour de l'interface utilisateur
        },
        error: (err) => {
          console.error('Erreur lors de la suppression du quiz', err);
          // Afficher une alerte d'erreur

        }
      });
    } else {
      console.log('Suppression annulée');
    }
  }


}
