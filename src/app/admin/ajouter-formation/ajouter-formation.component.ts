import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Formation } from 'src/models/Formation.model';
import { Quiz } from 'src/models/Quiz.model';
import { FormationsService } from 'src/services/formations.service';
import { UserServiceService } from 'src/services/user-service.service';


@Component({
  selector: 'app-ajouter-formation',
  templateUrl: './ajouter-formation.component.html',
  styleUrls: ['./ajouter-formation.component.css']
})
export class AjouterFormationComponent implements OnInit {
  formationForm: FormGroup;
  formation!: Formation;
  titreLecon: string = '';
  typeLecon: string = 'PDF'; // Ou autre type, selon votre cas
  contenuLecon: string = '';
  message: string | null = null;
  titreModule: string = '';
  selectedModule: any = null;
  dropdownOpen = false;
  formationId: any | undefined ;
  ModuleId: any | undefined ;
  isModuleCardVisible: boolean = false;
  isQuizCardVisible: boolean = false;
  modules: any[] = [];


    users : any[] =[] ;
    filteredProjects: any[] = [];

  constructor(
    private fb: FormBuilder,
    private userService: UserServiceService,
    private formationService: FormationsService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    // Initialisation du formulaire avec validation
    this.formationForm = this.fb.group({
      titre: ['', Validators.required],
      description: ['', Validators.required],
      thematique: ['', Validators.required],
      ressource: [''],
      responsable: ['', Validators.required],
      departement: ['', Validators.required],
      photo: [''],
      videoIntroduction : [''],
      duree: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.userService.getUser().subscribe((data) => {
      this.users = data;
      console.log("Liste des utilisateurs :", this.users);
    }, error => {
      console.error("Erreur lors de la récupération des utilisateurs :", error);
    });


  }

  step: number = 1; // Étape actuelle

  nextStep() {
    // Valider seulement les champs de l'étape actuelle
    if (this.step === 1) {
      const step1Controls = ['titre', 'thematique', 'departement', 'responsable'];
      step1Controls.forEach(control => {
        this.formationForm.get(control)?.markAsTouched();
      });

      const step1Valid = step1Controls.every(control =>
        this.formationForm.get(control)?.valid
      );

      if (!step1Valid) {
        this.message = 'Veuillez remplir tous les champs obligatoires';
        return;
      }
    }

    if (this.step < 2) { // Changé de 4 à 2 selon votre HTML
      this.step++;
      this.message = null; // Effacer le message d'erreur
    }
  }

  prevStep() {
    if (this.step > 1) {
      this.step--;
      this.message = null; // Effacer le message d'erreur
    }
  }

  toggleModuleCard() {
    this.isModuleCardVisible = !this.isModuleCardVisible;
  }
  verifLecon : boolean = false ;
  verifL() {

    this.verifLecon = !this.verifLecon ;
  }

selectedRessources: File[] = []; // Pour les ressources (PDF, TXT)

onRessourcesSelected(event: Event): void {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    // Convertir FileList en tableau et ajouter aux fichiers déjà sélectionnés (si besoin)
    const files = Array.from(input.files);
    this.selectedRessources = this.selectedRessources.concat(files);
    // Optionnel : Vous pouvez réinitialiser l'input pour permettre de re-sélectionner les mêmes fichiers
    input.value = '';
  }
}

removeFile(index: number): void {
  this.selectedRessources.splice(index, 1);
}


  // Méthode pour soumettre le formulaire
  onSubmit(): void {

    this.formationForm.markAllAsTouched();

  if (this.formationForm.invalid) {
    this.message = 'Veuillez corriger les erreurs dans le formulaire';
    return;
  }


    // Créer un FormData pour envoyer les données du formulaire et les fichiers
    const formData = new FormData();

    // Ajouter les données du formulaire
    const formationData = this.formationForm.value;
    for (const key in formationData) {
      if (formationData.hasOwnProperty(key)) {
        formData.append(key, formationData[key]);
      }
    }

    // Ajouter la photo si elle est sélectionnée
    if (this.selectedFile) {
      formData.append('photo', this.selectedFile);
    }
    if (this.videoIntroductionFile) {
      formData.append('videoIntroduction', this.videoIntroductionFile);
    }

    // Ajouter les fichiers de ressources
    if (this.selectedRessources.length > 0) {
      this.selectedRessources.forEach((file: File) => {
        formData.append('ressource', file);
      });
    }

    // Envoyer les données au backend
    this.formationService.addFormation(formData).subscribe({
      next: (response) => {
        this.message = response.message;
        this.formationId = response.formationId; // Utiliser _id directement
        console.log('ID de la formation ajoutée:', response._id);
      },
      error: (err) => {
        this.message = err.error.message || 'Une erreur est survenue.';
      }
    });
  }



  addModule() {
    if (this.titreModule.trim() === '') {
      this.message = 'Le titre du module est requis.';
      return;
    }

    this.formationService.addModuleToFormation(this.formationId, this.titreModule).subscribe({
      next: (response) => {
        this.message = 'Module ajouté avec succès à la formation !';
        this.ModuleId = response.moduleId;

        // Rafraîchir les données de la formation pour voir les modules à jour
        this.formationService.getFormationById(this.formationId).subscribe({
          next: (data) => {
            console.log("Données mises à jour pour la formation :", data);
            this.formation = data;
            this.titreModule = ''; // Réinitialiser le champ après l'ajout
          },
          error: (err) => console.error("Erreur lors du rafraîchissement des modules", err),
        });
      },
      error: (err) => {
        this.message = 'Erreur lors de l\'ajout du module : ' + err.message;
        console.error(err);
      }
    });
  }
  selectedFile: File | null = null;
  selectedFileName: string = '';
  videoIntroductionFile : File | null = null;
  videoIntroductionName : string = '';





  onFileSelected(event: any): void {
    const fileInput = event.target as HTMLInputElement;

    if (fileInput.files && fileInput.files.length > 0) {
      this.selectedFile = fileInput.files[0];
      this.selectedFileName = this.selectedFile.name;
    }
  }

  onFileSelectedvideoIntroduction(event: any): void {
    const fileInput = event.target as HTMLInputElement;

    if (fileInput.files && fileInput.files.length > 0) {
      this.videoIntroductionFile = fileInput.files[0];
      this.videoIntroductionName = this.videoIntroductionFile.name;
    }
  }
  //Partie de lecon  :


  newLeconTitle: string = '';
  newLeconDescription: string = '';
  newLeconFile: any | null = null;
  newLeconType: 'text' | 'video' | 'PDF' | 'PPT' = 'text';


  // Handle adding a lesson
  addLecon(module: any) {
    this.formationService.addLecon(this.ModuleId, this.newLeconTitle, this.newLeconDescription, this.newLeconFile, this.newLeconType).subscribe(
      response => {
        console.log('Leçon ajoutée avec succès', response);
        module.lecons.push(response); // Assuming the response contains the added lecon
        // Reset the form fields
        this.newLeconTitle = '';
        this.newLeconDescription= ''
        this.newLeconFile = null;

      },
      error => {
        console.error('Erreur lors de l\'ajout de la leçon', error);
      }
    );
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this. newLeconFile = file;
    }
  }

  // Toggle visibility of module lessons
  toggleLecons(module: any) {
    this.selectedModule = this.selectedModule === module ? null : module;
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
    text: '',
    options: [''],
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

}
