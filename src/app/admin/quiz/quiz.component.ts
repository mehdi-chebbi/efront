import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Quiz } from 'src/models/Quiz.model';
import { FormationsService } from 'src/services/formations.service';

@Component({
  selector: 'app-quiz',
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.css']
})
export class QuizComponent {

  isQuizCardVisible : boolean = false;
  formationId: any;


  constructor(private formationService:FormationsService,private route: ActivatedRoute)
  {

  }


  ngOnInit()
  {
    this.formationId = this.route.snapshot.paramMap.get('id') || '';
    console.log("ID Formation récupéré depuis l'URL :", this.formationId);
  }

   toggleModuleCardQuiz() {
      this.isQuizCardVisible = !this.isQuizCardVisible;
    }
    // Existing method for adding modules

    quiz: Quiz = { titre: '', questions: [] };

    submitQuiz() {
      if (!this.formationId) {
        console.error("Aucune formation sélectionnée !");
        return;
      }

      this.formationService.ajouterUnQuiz(this.formationId, this.quiz).subscribe({
        next: (response) => {
          console.log('Quiz ajouté avec succès', response);
          alert("Quiz ajouté avec succès !");
          this.resetQuizForm();
        },
        error: (error) => {
          console.error('Erreur lors de l’ajout du quiz', error);
          alert("Erreur lors de l'ajout du quiz.");
        }
      });
    }

    // Réinitialiser le formulaire du quiz
    resetQuizForm() {
      this.quiz = { titre: '', questions: [] };
    }

  // Ajouter une question
  addQuestion() {
    this.quiz?.questions.push({
      text: "",
      options: [""],
      correctOption: 0
    });
  }

  // Supprimer une question
  removeQuestion(index: number) {
    this.quiz?.questions.splice(index, 1);
  }

  // Ajouter une option à une question
  addOption(questionIndex: number) {
    // Ajoute une nouvelle option vide à la question spécifiée
    this.quiz.questions[questionIndex].options.push('');
  }

  removeOption(questionIndex: number, optionIndex: number) {
    // Supprime l'option spécifiée de la question
    this.quiz.questions[questionIndex].options.splice(optionIndex, 1);

    // Si l'option supprimée était l'option correcte, réinitialiser correctOption
    if (this.quiz.questions[questionIndex].correctOption === optionIndex) {
      this.quiz.questions[questionIndex].correctOption = 0;
    }
  }
  trackByIndex(index: number, item: any) {
    return index; // ou une valeur unique par option si applicable
  }



}
