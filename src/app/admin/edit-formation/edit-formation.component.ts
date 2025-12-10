import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import jwt_decode from 'jwt-decode';
import { Formation } from 'src/models/Formation.model';
import { Lecon } from 'src/models/Lecon.model';
import { FormationsService } from 'src/services/formations.service';
import { UserServiceService } from 'src/services/user-service.service';

@Component({
  selector: 'app-edit-formation',
  templateUrl: './edit-formation.component.html',
  styleUrls: ['./edit-formation.component.css']
})
export class EditFormationComponent {
  formationForm: FormGroup;
  formation: Formation = {
    _id: '',
    titre: '',
    description: '',
    photo: '',
    thematique: '',
    departement: '',
    ressource: '',
    videoIntroduction:'',
    responsable: { _id: '', nom: '' }, // ✅ Initialize as an object
    duree: '',
    message: null,
    modules: [] ,
    quiz : []
  };
  users: any[] = [];
  titreModule: string = '';
  ModuleId: any ; // Liste des utilisateurs
  newPhoto: File | null = null; // Pour savoir si une nouvelle photo est sélectionnée
  message: string | null = null;
  constructor(
    private formationService: FormationsService,
    private userService: UserServiceService,
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.formationForm = this.fb.group({
      titre: ['', [Validators.required]],
      thematique: ['', [Validators.required]],
      departement: ['', [Validators.required]],
      ressource: ['', [Validators.required]],

      responsable: ['', [Validators.required]],
      description: ['', [Validators.required]],
      photo: [''],
      videoIntroduction : [''],
      duree: ['', [Validators.required]]
    });
  }
  formationId: any;
  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.getFormationById(id);
      this.getUsers(); // Charger les utilisateurs pour le champ responsable
    }
    this.formationId = this.route.snapshot.paramMap.get('id');
  }





  getFormationById(id: string): void {
    this.formationService.getFormationById(id).subscribe(
      (data) => {
        this.formation = data;
        this.formationForm.patchValue(this.formation); // Remplir le formulaire avec les données de la formation
      },
      (error) => {
        console.error('Erreur lors de la récupération de la formation:', error);
      }
    );
  }

  getUsers(): void {
    this.userService.getUser().subscribe(
      (users) => {
        this.users = users;
      },
      (error) => {
        console.error('Erreur lors de la récupération des utilisateurs:', error);
      }
    );
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.newPhoto = file; // Sauvegarde de l'image sélectionnée
    }
  }

  videoIntroductionFile : File | null = null;

  onFileSelectedvideoIntroduction(event: any): void {
    const fileInput = event.target as HTMLInputElement;

    if (fileInput.files && fileInput.files.length > 0) {
      this.videoIntroductionFile = fileInput.files[0];

    }
  }

  onSubmit(): void {
    const formData = new FormData();
    const formValues = this.formationForm.value;

    // Ajouter les autres données du formulaire
    formData.append('titre', formValues.titre);
    formData.append('thematique', formValues.thematique);
    formData.append('departement', formValues.departement);
    formData.append('responsable', formValues.responsable);
     formData.append('videoIntroduction', formValues.videoIntroduction);
    formData.append('description', formValues.description);
    formData.append('duree', formValues.duree);

    // Gestion des ressources :
    // Si de nouveaux fichiers ont été sélectionnés, on les ajoute.
    // Sinon, vous pouvez choisir de ne rien envoyer pour conserver les ressources existantes
    if (this.selectedRessources && this.selectedRessources.length > 0) {
      this.selectedRessources.forEach((file: File) => {
        formData.append('ressource', file, file.name);
      });
    }

    // Gestion de la photo :
    // Si une nouvelle photo a été sélectionnée, on l'ajoute, sinon on garde l'ancienne.
    if (this.newPhoto) {
      formData.append('photo', this.newPhoto, this.newPhoto.name);
    } else if (this.formation.photo) {
      formData.append('photo', this.formation.photo);
    }
    if (this.videoIntroductionFile) {
      formData.append('videoIntroduction', this.videoIntroductionFile, this.videoIntroductionFile.name);
    } else if (this.formation.videoIntroduction) {
      formData.append('videoIntroduction', this.formation.videoIntroduction);
    }

    // Appel au service pour mettre à jour la formation avec FormData
    this.formationService.updateFormation(this.formation._id, formData).subscribe(
      (response) => {
        console.log('Formation mise à jour avec succès', response);
        this.router.navigate(['/admin/dash']); // Redirection vers la liste des formations
      },
      (error) => {
        console.error('Erreur lors de la mise à jour de la formation:', error);
      }
    );
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
  selectedModule: any = null;
  toggleLecons(module: any): void {
    if (this.selectedModule === module) {
      this.selectedModule = null; // Si le module est déjà sélectionné, on le désélectionne
    } else {
      this.selectedModule = module; // Sélectionner ce module
    }
  }

  deleteModule(moduleId: any) {
    if (confirm('Voulez-vous vraiment supprimer ce module ?')) {
      this.formationService.deleteModule(this.formationId, moduleId).subscribe(
        (response) => {
          console.log('Module supprimé avec succès', response);


          this.formation.modules = this.formation.modules.filter(m => m._id !== moduleId); // Mise à jour de la liste
        },
        (error) => {
          console.error('Erreur lors de la suppression du modulezzzz', error);

        }
      );
    }
  }
  deleteLecon(leconId: any): void {
    if (confirm('Voulez-vous vraiment supprimer cette leçon?')) {
      this.formationService.deleteLecon(this.selectedModule._id, leconId).subscribe(
        (response) => {
          console.log('Leçon supprimée avec succès', response);

          // Mise à jour de la liste des leçons après suppression
          this.selectedModule.lecons = this.selectedModule.lecons.filter((m: Lecon) => m._id !== leconId);
        },
        (error) => {
          console.error('Erreur lors de la suppression de la leçon', error);
        }
      );
    }
  }

  addModule() : void {
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

  isModuleCardVisible: boolean = false;
  toggleModuleCard() {
    this.isModuleCardVisible = !this.isModuleCardVisible;
  }

  verifLecon : boolean = false ;
  verifL() {

    this.verifLecon = !this.verifLecon ;
  }
  selectedRessources: File[] = [];

  onRessourcesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      // Concaténer avec les fichiers déjà sélectionnés (si nécessaire)
      this.selectedRessources = this.selectedRessources.concat(Array.from(input.files));
      // Optionnel : réinitialiser l'input pour permettre de re-sélectionner les mêmes fichiers
      input.value = '';
    }
  }
  removeFile(index: number): void {
    this.selectedRessources.splice(index, 1);
  }

  newLeconTitle: string = '';
  newLecondescription: string = '';
  newLeconFile: any | null = null;
  newLeconType: 'text' | 'video' | 'PDF' | 'PPT' = 'text';


  // Handle adding a lesson
  addLecon(module: any) {
    // Send the request to add a lesson
    this.formationService.addLecon(module._id, this.newLeconTitle,this.newLecondescription, this.newLeconFile, this.newLeconType).subscribe(
      response => {
        console.log('Leçon ajoutée avec succès', response);
        // After adding the lesson, update the module's lessons list
        module.lecons.push(response); // Assuming the response contains the added lecon
        // Reset the form fields
        this.newLeconTitle = '';
        this.newLecondescription= ''
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

}
