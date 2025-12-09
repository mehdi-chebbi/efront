import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormationsService } from 'src/services/formations.service';
import { QuizService } from 'src/services/quiz.service';

@Component({
  selector: 'app-detail-quiz',
  templateUrl: './detail-quiz.component.html',
  styleUrls: ['./detail-quiz.component.css']
})
export class DetailQuizComponent {
  quiz: any; // Stocke les détails du quiz
  quizId!: string;
  iDformation!: any;
  editingIndex: number | null = null;
  editingAnswerIndex: { questionIndex: number, answerIndex: number } | null = null;
  constructor(
    private route: ActivatedRoute,
    private quizService: QuizService,
    private formationService: FormationsService
  ) {}

  ngOnInit(): void {
    // Récupérer l'ID du quiz depuis l'URL
    this.quizId = this.route.snapshot.paramMap.get('idQuiz') || '';
    this.iDformation= this.route.snapshot.paramMap.get('idformation')
    console.log("ID du Quiz récupéré :", this.quizId);

    // Récupérer les détails du quiz par ID
    this.quizService.getQuizById(this.quizId).subscribe({
      next: (data) => {
        this.quiz = data;
        console.log("Détails du Quiz :", data);
      },
      error: (err) => console.error("Erreur lors de la récupération du Quiz :", err)
    });
  }

  hoverEffect(event: MouseEvent) {
    const target = event.target as HTMLElement;
    target.style.transform = 'scale(1.02)';
    target.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
  }

  removeHoverEffect(event: MouseEvent) {
    const target = event.target as HTMLElement;
    target.style.transform = 'scale(1)';
    target.style.boxShadow = 'none';
  }

  editQuestion(index: number) {
    this.editingIndex = index; // Active le mode édition pour la question sélectionnée
  }

  saveQuestion(index: number) {
    this.editingIndex =null ;
    if (this.quiz && this.quiz.questions && this.quiz.questions[index]) {
      const updatedQuestion = this.quiz.questions[index]; // Récupère la question mise à jour

      this.formationService.updateQuizByIdFormation(this.iDformation,  this.quizId , this.quiz)
        .subscribe(
          response => {
            console.log("Question mise à jour avec succès", response);
            this.editingIndex = null; // Sort du mode édition
          },
          error => {
            console.error("Erreur lors de la mise à jour de la question", error);
          }
        );
    }
  }

  saveAnswer() {
    if (this.editingAnswerIndex) {
      const { questionIndex, answerIndex } = this.editingAnswerIndex;
      const updatedAnswer = this.quiz.questions[questionIndex].options[answerIndex]; // Récupère la réponse mise à jour

      this.formationService.updateQuizByIdFormation(this.iDformation,  this.quizId , this.quiz)
        .subscribe(
          response => {
            console.log("Réponse mise à jour avec succès", response);
            this.editingAnswerIndex = null; // Sort du mode édition
          },
          error => {
            console.error("Erreur lors de la mise à jour de la réponse", error);
          }
        );
    }
  }

  addAnswer(questionIndex: number) {
    console.log('Ajout d\'une nouvelle réponse pour la question:', questionIndex);
    this.quiz.questions[questionIndex].options.push("Nouvelle réponse"); // Ajoute une réponse préremplie

    this.formationService.updateQuizByIdFormation(this.iDformation,  this.quizId , this.quiz)
      .subscribe(
        response => {
          console.log("Réponse ajoutée avec succès", response);
        },
        error => {
          console.error("Erreur lors de l'ajout de la réponse", error);
        }
      );
  }
  setCorrectAnswer(questionIndex: number, answerIndex: number) {
    // Mettre à jour la bonne réponse en local
    this.quiz.questions[questionIndex].correctOption = answerIndex;

    // Mettre à jour dans la base de données
    this.formationService.updateQuizByIdFormation(this.iDformation, this.quizId, this.quiz)
      .subscribe(
        response => {
          console.log("Bonne réponse mise à jour avec succès", response);
        },
        error => {
          console.error("Erreur lors de la mise à jour de la bonne réponse", error);
        }
      );
  }

  supprimerQuestion(questionIndex: number) {
    // Vérifier avant de supprimer
    if (confirm("Voulez-vous vraiment supprimer cette question ?")) {

      // Supprimer la question localement
      this.quiz.questions.splice(questionIndex, 1);

      // Mettre à jour dans la base de données
      this.formationService.updateQuizByIdFormation(this.iDformation, this.quizId, this.quiz)
        .subscribe(
          response => {
            console.log("Question supprimée avec succès", response);
          },
          error => {
            console.error("Erreur lors de la suppression de la question", error);
          }
        );
    }
  }



  addQuestion() {
    const newQuestion = {
      text: 'Nouvelle question',
      options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'], // Options par défaut
      correctOption: 0 // Par défaut, la première option est correcte
    };

    this.quiz.questions.push(newQuestion);
  }



  editAnswer(questionIndex: number, answerIndex: number) {
    console.log('Modifier la réponse:', questionIndex, answerIndex);
    this.editingAnswerIndex = { questionIndex, answerIndex };
  }

  DeleteAnswer(questionIndex: number, answerIndex: number) {
    console.log('Supprimer la réponse:', questionIndex, answerIndex);
    this.quiz.questions[questionIndex].options.splice(answerIndex, 1); // Supprimer la réponse à cet index
    this.formationService.updateQuizByIdFormation(this.iDformation,  this.quizId , this.quiz)
      .subscribe(
        response => {
          console.log("Réponse supprimée avec succès", response);
        },
        error => {
          console.error("Erreur lors de la suppression de la réponse", error);
        }
      );
  }

  trackByIndex(index: number, item: any) {
    return index; // ou une valeur unique par option si applicable
  }
}
