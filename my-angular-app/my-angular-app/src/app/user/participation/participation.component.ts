import { ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import jwt_decode from 'jwt-decode';

import { Formation } from 'src/models/Formation.model';
import { FormationsService } from 'src/services/formations.service';
import { ParticipationService } from 'src/services/participation.service';
import { UserServiceService } from 'src/services/user-service.service';
import * as pdfjsLib from 'pdfjs-dist';
import { GlobalWorkerOptions, PDFDocumentProxy } from 'pdfjs-dist';
import 'pdfjs-dist/build/pdf.worker.entry';
import { Module } from 'src/models/Module.model';
import { QuizService } from 'src/services/quiz.service';

interface QuizEvaluation {
  quizId: string;
  evaluations: number;
  _id: string;
}

interface QuizzesResponse {
  quizzes: QuizEvaluation[];
}
@Component({
  selector: 'app-participation',
  templateUrl: './participation.component.html',
  styleUrls: ['./participation.component.css']
})
export class ParticipationComponent {
  @ViewChild('pdfContainer') pdfContainer!: ElementRef;

  formation!: Formation;
  formationId!: string;
  isFullScreen: boolean = false;
  user: any = {};
  isInscrit: boolean = false;
  Lecons: any[] = [];
  selectedModule: any = null;
  dropdownOpen = false;
  isLoading: boolean = false;
  errorMessage: string = '';
  filteredLecons: any[] = [];
  extractedPdfContent: string = '';
  moduleIDD: any;
  LeconssIdd: any;
  quizzes: any[] = [];
  countt: number | undefined;


  constructor(
    private formationService: FormationsService,
    private userService: UserServiceService,
    private router: Router,
    private quizService : QuizService,
    private cdr: ChangeDetectorRef,
    private particiationService: ParticipationService,
    private route: ActivatedRoute
  ) {}

  count() {
    return this.formation.modules.length;
  }


  quizzesWithEvaluations: any[] = [];
  ngOnInit(): void {
    this.formationId = this.route.snapshot.paramMap.get('formationId') || '';
    console.log("ID Formation récupéré depuis l'URL :", this.formationId);

    // Get formation by ID
    this.formationService.getFormationById(this.formationId).subscribe({
      next: (data) => {
        console.log("Données reçues pour la formation :", data);
        this.formation = data;
      },
      error: (err) => console.error("Erreur lors du chargement de la formation", err),
    });

    // Get user details from the token
    const token = localStorage.getItem('authToken');
    if (token) {
      const decodedToken: any = jwt_decode(token);
      const userId = decodedToken.userId;

      this.userService.getUserDetails(userId).subscribe({
        next: (data) => {
          this.user = data;
          console.log('Utilisateur récupéré:', this.user);


          // Maintenant que l'utilisateur est chargé, nous pouvons récupérer son avancement
          this.getUserProgress();
          this.fetchQuizzes();
        },
        error: (err) => console.error("Erreur lors de la récupération des infos utilisateur", err)
      });
    } else {
      console.error('Token non trouvé');
    }


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



  }
  quizEvaluation: any[] = [];
  totaleEvaluation : any
  loading: boolean = false;
  fetchQuizzes(): void {
    this.userService.getQuizzes(this.user._id, this.formationId).subscribe({
      next: (response) => {
        this.quizEvaluation = response.quizzes;

        // Calcul de la somme des évaluations
        const sum = response.quizzes.reduce((total: number, quiz: any) => {
          return total + (quiz.evaluations ? Number(quiz.evaluations) : 0);
        }, 0);

        // Calcul de la moyenne (seulement s'il y a des quizzes)
        this.totaleEvaluation = response.quizzes.length > 0
          ? sum / response.quizzes.length
          : 0;

        console.log('Moyenne des évaluations:', this.totaleEvaluation);
      },
      error: (error) => {
        console.error('Erreur lors de la récupération des quizzes:', error);
      }
    });
  }


  afficherQuiz(idquiz: string): void {
    this.quizService.getQuizById(idquiz).subscribe({
      next: (data) => {
        this.quizzes.push(data);  // Ajoute le quiz récupéré à la liste des quizzes

        // Vérification si 'data.questions' est défini et est un tableau
        if (Array.isArray(data.questions)) {
          this.countt = data.questions.length; // Récupère le nombre de questions dans le tableau 'questions'
        } else {
          this.countt = 0; // Si 'data.questions' n'est pas un tableau ou est undefined, on met count à 0
        }

        // Affiche le nombre de questions pour ce quiz spécifique
        console.log(`Le quiz avec l'ID ${idquiz} a ${this.count} question(s).`);
        //console.log("Quiz récupéré :", data);
      },
      error: (err) => {
        console.error("Erreur de récupération du quiz :", err);
      }
    });
  }

  max : boolean = false;
  pourcentageTotal: number = 0;
   // Variable pour stocker la progression totale


   getUserProgress(): void {
    if (this.user && this.user._id) {
      this.userService.findProgresByIdUser(this.user._id).subscribe({
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

// Vérifie si le module précédent est terminé
isPreviousModuleCompleted(currentModuleIndex: number): boolean {
  // Le premier module est toujours accessible
  if (currentModuleIndex === 0) {
    return true;
  }

  // Vérifie si `this.progresUser` existe et est un tableau
  if (!this.progresUser || !Array.isArray(this.progresUser)) {
    console.error("progresUser n'est pas défini ou n'est pas un tableau");
    return false; // Ou `true` si vous voulez autoriser l'accès par défaut
  }

  // Vérifie si `this.formation` et `this.formation.modules` existent
  if (!this.formation || !this.formation.modules || currentModuleIndex - 1 >= this.formation.modules.length) {
    console.error("Formation ou modules non chargés correctement");
    return false;
  }

  const previousModule = this.formation.modules[currentModuleIndex - 1];
  console.log('Module précédent:', previousModule);
  console.log('Progression utilisateur:', this.progresUser);

  // Vérifie si l'utilisateur a terminé le module précédent (max1 === true)
  const isCompleted = this.progresUser.some((p: any) => p.moduleId === previousModule._id && p.max1 === true);
  console.log('Module précédent terminé ?', isCompleted);

  return isCompleted;
}
toggleLecons(module: any, index: number): void {
  if (this.isPreviousModuleCompleted(index)) {
    this.selectedModule = this.selectedModule === module ? null : module;
  } else {
    console.log("Ce module est verrouillé. Vous devez terminer le module précédent.");
  }
}

  toggleFullScreen(): void {
    const element = this.pdfContainer.nativeElement;

    if (this.isFullScreen) {
      // Sortir du plein écran
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      } else if ((document as any).msExitFullscreen) {
        (document as any).msExitFullscreen();
      }
    } else {
      // Passer en plein écran sur l'élément
      if (element.requestFullscreen) {
        element.requestFullscreen();
      } else if ((element as any).webkitRequestFullscreen) {
        (element as any).webkitRequestFullscreen();
      } else if ((element as any).msRequestFullscreen) {
        (element as any).msRequestFullscreen();
      }
    }

    this.isFullScreen = !this.isFullScreen;
  }

  progres: number = 75; // Valeur par défaut, peut être mise à jour dynamiquement

  getProgressColor(progress: number): string {
    if (progress === 100) return "green";
    if (progress >= 50) return "red";
    if (progress <= 25) return "yellow";
    return "blue";
  }

  toutesLesLecons: any[] = [] ;

  VoirLecon(id: any, idlecon: any, lecon: any): void {
    console.log('Module ID:', id);
    console.log('Leçon ID:', idlecon);
    console.log('Leçon:', lecon);

    // Vérifie si le module est disponible
    const moduleIndex = this.formation.modules.findIndex((m: any) => m._id === id);
    if (!this.isPreviousModuleCompleted(moduleIndex)) {
      console.log("Ce module est verrouillé. Vous devez terminer le module précédent.");
      return;
    }

    // Récupère les leçons du module
    this.formationService.getLeconsByModule(id).subscribe({
      next: (Lecon) => {
        console.log('Leçons récupérées:', Lecon);

        // Filtre les leçons pour afficher uniquement celle sélectionnée
        this.toutesLesLecons = Array.isArray(Lecon?.lecons) ? Lecon.lecons : [];
        this.filteredLecons = this.toutesLesLecons.filter((l: any) => l._id === idlecon);
        console.log('Leçons filtrées:', this.filteredLecons);

        // Vérifie si le contenu est un PDF et déclenche l'extraction d'images
        this.filteredLecons.forEach(l => {
          if (l.contenu?.endsWith('.pdf')) {
            this.extractImagesFromPDF(l.contenu);
            console.log('Contenu PDF:', l.contenu);
          }
        });
      },
      error: (err) => {
        console.error("Erreur lors du chargement de la formation", err);
        this.filteredLecons = [];
        this.errorMessage = 'Erreur lors du chargement des données.';
      },
    });
  }

  logout(): void {
    this.userService.logout().subscribe({
      next: () => {
        localStorage.removeItem("authToken");
        this.router.navigate(["/user/auth"]);
      },
      error: (err) => console.error("Erreur de déconnexion :", err)
    });
  }




extractedPdfImages: any[] = [];

currentPage: number = 1;  // Page actuelle
totalPages: number = 0;   // Total des pages du PDF
 // Message d'erreur
pdf: PDFDocumentProxy | null = null;  // Déclarez pdf comme une propriété

// Extraire et afficher les images une par une avec pagination
extractImagesFromPDF(pdfUrl: string): void {
  this.isLoading = true;
  this.extractedPdfImages = [];  // Vider les images extraites précédemment
  this.currentPage = 1;  // Réinitialiser à la première page
  this.errorMessage = '';

  const loadingTask = pdfjsLib.getDocument({ url: pdfUrl, withCredentials: true });

  loadingTask.promise
    .then(async (pdfDoc: PDFDocumentProxy) => {
      this.pdf = pdfDoc;  // Sauvegarder le PDF dans la propriété 'pdf'
      this.totalPages = pdfDoc.numPages;  // Obtenir le nombre total de pages

      // Charger la première page
      await this.loadPage(this.currentPage);
    })
    .catch((error) => {
      console.error("Erreur d'extraction du PDF :", error);
      this.errorMessage = 'Erreur lors de l’extraction du PDF.';
    })
    .finally(() => {
      this.isLoading = false;
    });
}

isPDF(content: string): boolean {
  return content?.toLowerCase().endsWith('.pdf') ||
         content?.includes('application/pdf');
}

isVideo(content: string): boolean {
  const videoExtensions = ['.mp4', '.webm', '.ogg'];
  return videoExtensions.some(ext => content?.toLowerCase().endsWith(ext));
}

isImage(content: string): boolean {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  return imageExtensions.some(ext => content?.toLowerCase().endsWith(ext));
}

// Fonction pour charger une page spécifique
async loadPage(pageNumber: number): Promise<void> {
  if (!this.pdf) {
    console.error("PDF non chargé");
    return;
  }

  if (pageNumber < 1 || pageNumber > this.totalPages) return; // S'assurer que le numéro de page est valide

  try {
    const page = await this.pdf.getPage(pageNumber);
    const viewport = page.getViewport({ scale: 1 }); // Utiliser une échelle de 1 pour un rendu rapide

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    if (!context) {
      console.error("Erreur lors de la création du contexte canvas.");
      this.errorMessage = 'Erreur lors de la création du contexte canvas.';
      return;
    }

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    // Rendre la page sur le canvas
    await page.render({ canvasContext: context, viewport }).promise;

    // Convertir le canvas en image base64
    const imageUrl = canvas.toDataURL("image/png");
    this.extractedPdfImages = [imageUrl];  // Remplacer l'image précédente par la nouvelle

  } catch (error) {
    console.error("Erreur lors du rendu de la page", error);
    this.errorMessage = 'Erreur lors du rendu de la page.';
  }
}

// Fonction pour afficher la page suivante
nextPage(): void {
  if (this.pdf && this.currentPage < this.totalPages) {
    this.currentPage++;
    this.loadPage(this.currentPage);  // Charger la page suivante
  }
}

// Fonction pour afficher la page précédente
previousPage(): void {
  if (this.pdf && this.currentPage > 1) {
    this.currentPage--;
    this.loadPage(this.currentPage);  // Charger la page précédente
  }
}

  handleFileContent(contenu: string): string {
    if (contenu?.endsWith('.pdf')) {
      return 'pdf';
    } else if (contenu?.endsWith('.ppt') || contenu?.endsWith('.pptx')) {
      return 'ppt';
    } else if (contenu?.endsWith('.txt')) {
      return 'txt';
    } else {
      return 'default';
    }
  }
  isCompleted : boolean = false;
  verif : boolean =false;

  calculateProgress(): number {
    if (this.toutesLesLecons.length === 0) {
      return 0; // Si aucune leçon n'est disponible, la progression est à 0%
    }
    // Pour le cours terminé, on renvoie 100%
    return this.toutesLesLecons.length;
  }

 avancementTotal : number = 0 ;
 updateProgress(lecon: any, moduleId: string): void {
  const newProgress = 100 / this.calculateProgress();

  this.userService.updateAvancement(this.user._id, lecon._id, moduleId, newProgress)
    .subscribe({
      next: (response) => {
        console.log('Avancement mis à jour avec succès:', response);

        // Recharger les progrès de l'utilisateur
        this.getUserProgress();
      },
      error: (error) => {
        console.error('Erreur lors de la mise à jour de l\'avancement:', error);
      }
    });
}
   progresUser : any




   checkProgress(lecon: any, moduleId: string): void {

  }
  isProgressCompleted(moduleId: string, leconId: string): boolean {
    if (!this.progresUser) return false;  // Early return if undefined/null

    const progress = this.progresUser.find((p: { moduleId: string; leconId: string; }) =>
        p.moduleId === moduleId && p.leconId === leconId);

    return progress ? progress.progres !== 0 : false;
}
  isModuleComplete(moduleId: string): boolean {
    return this.progresUser?.some((p: { moduleId: string; max1: boolean; }) =>
        p.moduleId === moduleId && p.max1 === true) ?? false;
}

isModuleCompleteVerif(): boolean {
    return this.progresUser?.some((p: { moduleId: string; max1: boolean; }) =>
        p.max1 === true) ?? false;
}

canSelectNextModule(module: any): boolean {
    return this.progresUser?.some((p: any) =>
        p.moduleId === module._id && p.max1 === true) ?? false;
}

isTotaleComplete(moduleId: string): boolean {
    return this.progresUser?.some((p: { moduleId: string; }) =>
        p.moduleId === moduleId) ?? false;
}
// Ajoutez ces variables dans votre composant
selectedQuizId: any | null = null;
currentView: 'formation' | 'quiz' = 'formation'; // Pour gérer l'affichage

// Variables
userAnswers: number[] = []; // Pour stocker les réponses de l'utilisateur

// Méthodes

getOptionLetter(index: number): string {
  return String.fromCharCode(65 + index); // 65 = 'A' en ASCII
}

currentQuestionIndex: number = 0;

getCurrentQuestion() {
  const quiz = this.quizzes.find(q => q._id === this.selectedQuizId);
  return quiz?.questions[this.currentQuestionIndex];
}

nextQuestion() {
  if (this.currentQuestionIndex < this.getQuizQuestionCount(this.selectedQuizId) - 1) {
    this.currentQuestionIndex++;
  }
}

previousQuestion() {
  if (this.currentQuestionIndex > 0) {
    this.currentQuestionIndex--;
  }
}

resetQuizNavigation() {
  this.currentQuestionIndex = 0;
}

// Initialiser le tableau des réponses quand un quiz est sélectionné
startQuiz(quizId: string) {
  this.selectedQuizId = quizId;
  this.currentView = 'quiz';
  this.currentQuestionIndex = 0; // Réinitialiser l'index

  const quiz = this.quizzes.find(q => q._id === quizId);
  this.userAnswers = quiz ? new Array(quiz.questions.length).fill(null) : [];
}
backToFormation() {
  this.currentView = 'formation';
  this.selectedQuizId = null;
  this.currentQuestionIndex = 0;
  this.userAnswers = [];
}

getQuizTitle(quizId: string): string {
  const quiz = this.quizzes.find(q => q._id === quizId);
  return quiz ? quiz.titre : 'Quiz';
}

getQuizQuestionCount(quizId: string): number {
  const quiz = this.quizzes.find(q => q._id === quizId);
  return quiz ? quiz.questions.length : 0;
}

getQuizQuestions(quizId: string): any[] {
  const quiz = this.quizzes.find(q => q._id === quizId);
  return quiz ? quiz.questions : [];
}
  hasModules(): boolean {
    return (this.formation?.modules?.length || 0) > 0;
  }

  isLastModuleCompleted(): boolean {
    if (!this.formation?.modules?.length) return false;
    const lastModule = this.formation.modules[this.formation.modules.length - 1];
    return this.isModuleComplete(lastModule._id);
  }





  // Stockez les résultats des quiz
quizResults: {[key: string]: number} = {}; // {quizId: scorePercentage}

// Après soumission du quiz


// Dans votre composant
submitQuiz(): void {
  const quiz = this.quizzes.find(q => q._id === this.selectedQuizId);
  if (!quiz) {
    console.error("Quiz non trouvé !");
    return;
  }

  if (!quiz.questions || quiz.questions.length === 0) {
    console.error("Le quiz ne contient aucune question !");
    return;
  }

  // Calcul du score
  const score = quiz.questions.reduce((acc: number, question: any, index: number) => {
    return acc + (this.userAnswers[index] === question.correctOption ? 1 : 0);
  }, 0);

  // Éviter une division par zéro
  const percentage = quiz.questions.length > 0 ? (score / quiz.questions.length) * 100 : 0;

  // Vérification des valeurs avant envoi
  if (!this.user?._id || !this.formationId || !this.selectedQuizId) {
    console.error("Données utilisateur ou quiz invalides !");
    return;
  }

  const updateData = {
    userId: this.user._id, // `_id` est déjà une string normalement
    formationId: this.formationId,
    quizId: this.selectedQuizId,
    evaluation: percentage
  };

  this.userService.updateQuizEvaluation(updateData).subscribe({
    next: (response) => {
      console.log("Évaluation mise à jour avec succès", response);
      this.showQuizResult(percentage);
    },
    error: (err) => {
      console.error("Erreur lors de la mise à jour de l'évaluation :", err);
      alert("Une erreur est survenue lors de la mise à jour de l'évaluation. Veuillez réessayer !");
    }
  });
}



// Méthodes utilitaires pour l'affichage des étoiles
hasQuizResult(quizId: string): boolean {
  return this.quizResults.hasOwnProperty(quizId);
}

getQuizStars(quizId: string): boolean[] {
  if (!this.hasQuizResult(quizId)) return [false, false, false];

  const percentage = this.quizResults[quizId];
  return [
    percentage >= 80,    // 1 étoile si >= 80%
    percentage >= 50,    // 1 étoile si >= 50%
    percentage >= 30     // 1 étoile si >= 30%
  ];
}

showQuizResult(percentage: number): void {
  const stars = this.getQuizStars(this.selectedQuizId!);
  const starCount = stars.filter(star => star).length;

  let message = `Résultat: ${percentage.toFixed(1)}% - `;
  message += starCount > 0
    ? `${starCount} étoile${starCount > 1 ? 's' : ''}`
    : 'Pas encore évalué';

  // Utilisez un service de notification ou un toast ici
  alert(message);
}
getStarColor(percentage: number): string {
  // Convertir le pourcentage en valeur entre 0 et 1
  const value = percentage / 100;

  // Calculer les composantes RGB selon le pourcentage
  const r = Math.floor(255 * (1 - value));
  const g = Math.floor(255 * value);
  const b = 0;

  return `rgb(${r}, ${g}, ${b})`;
}

getBadgeColor(percentage: number): string {
  if (percentage >= 80) return '#235a25'; // Vert clair
  if (percentage >= 50) return '#8e6f12'; // Jaune clair
  return '#721d17'; // Rouge clair
}
getQuizProgress(quizId: string): number {
  // Implémentez votre logique de progression ici
  // Retourne un pourcentage entre 0 et 100
  return 0; // Remplacez par votre logique
}

getScoreClass(): string {
  const score = this.totaleEvaluation;
  if (score >= 80) return 'score-excellent';
  if (score >= 60) return 'score-good';
  if (score >= 40) return 'score-average';
  return 'score-poor';
}
getFeedbackMessage(): string {
  const score = this.totaleEvaluation;

  if (score >= 90) {
    return 'Performance exceptionnelle ! Vous pouvez consulter votre boîte mail pour recevoir votre certification dans cette formation envoyée par ossLearning.';
  }

  if (score >= 80) {
    return 'Excellent travail ! Vous pouvez consulter  votre certification dans cette formation envoyée par ossLearning.';
  }

  if (score >= 70) {
    return 'Très bon résultat ! Vous y êtes presque - continuez vos efforts pour obtenir votre certification.';
  }

  if (score >= 60) {
    return 'Bon score ! Poursuivez vos efforts pour atteindre le niveau de certification.';
  }

  if (score >= 50) {
    return 'Vous progressez bien ! Consolidez vos connaissances pour améliorer votre score.';
  }

  if (score >= 40) {
    return 'Continuez vos efforts ! Revoyez les points clés pour progresser.';
  }

  return 'Relisez attentivement les cours et réessayez. Vous pouvez y arriver !';
}
}
